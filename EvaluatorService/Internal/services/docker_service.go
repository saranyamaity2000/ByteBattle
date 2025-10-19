package services

import (
	"bytes"
	"context"
	"io"
	"log"
	"os"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/image"
	"github.com/docker/docker/client"
	"github.com/docker/docker/pkg/stdcopy"
	"maitysaranya.com/EvaluatorService/Internal/factory"
	"maitysaranya.com/EvaluatorService/Internal/models"
	"maitysaranya.com/EvaluatorService/Internal/models/lang"
)

type DockerCodeRunService interface {
	PullImageByCodingLang(codingLang lang.Language) error
	RunCodeInContainer(codeLang lang.Language, code string, input string, constraint models.ProblemConstraint) (*models.ExecutionResult, error)
}

type dockerServiceImpl struct {
	dockerCodeFactory factory.DockerCodeFactory
	dockerCli         *client.Client
}

func (d *dockerServiceImpl) PullImageByCodingLang(codingLang lang.Language) error {
	imageName, err := d.dockerCodeFactory.GetImageForLanguage(codingLang)
	if err != nil {
		return err
	}

	rc, err := d.dockerCli.ImagePull(context.Background(), imageName, image.PullOptions{})
	if err != nil {
		log.Printf("pull image %q: %v", imageName, err)
		return err
	}
	defer rc.Close()

	// Log the progress of pulling the image
	log.Printf("Pulling image %s...", imageName)
	_, err = io.Copy(os.Stdout, rc)
	if err != nil {
		log.Printf("Error reading pull progress: %v", err)
		return err
	}
	log.Printf("Successfully pulled image %s", imageName)
	return nil
}

func (d *dockerServiceImpl) RunCodeInContainer(codeLang lang.Language, code, input string, constraint models.ProblemConstraint) (*models.ExecutionResult, error) {
	image, err := d.dockerCodeFactory.GetImageForLanguage(codeLang)
	if err != nil {
		return nil, err
	}

	cmd, err := d.dockerCodeFactory.GetCommandForLanguage(codeLang, code, input)
	if err != nil {
		return nil, err
	}

	// container configuration
	containerConfig := &container.Config{
		Image: image,
		Cmd:   cmd,   // the command while running the container
		Tty:   false, // no interactive terminal needed
	}

	// Host configuration with resource limits
	hostConfig := &container.HostConfig{
		Resources: container.Resources{
			Memory: int64(constraint.MemoryLimitMB) * 1024 * 1024, // Convert MB to bytes
		},
		AutoRemove: false, // this will automatically remove not remove container after execution (we have to remove once logs are fetched)
	}

	resp, err := d.dockerCli.ContainerCreate(context.Background(), containerConfig, hostConfig, nil, nil, "")
	if err != nil {
		return nil, err
	}
	// remove container at the end of the function (notusing timeout context as it has to be killed)
	defer d.dockerCli.ContainerRemove(context.Background(), resp.ID, container.RemoveOptions{
		Force: true,
	})

	// Start the container
	if err := d.dockerCli.ContainerStart(context.Background(), resp.ID, container.StartOptions{}); err != nil {
		return nil, err
	}

	// Create container with timeout context
	timeoutCtx, cancel := context.WithTimeout(context.Background(), constraint.TimeLimit)
	defer cancel()

	// Wait for container to finish
	statusCh, errCh := d.dockerCli.ContainerWait(timeoutCtx, resp.ID, container.WaitConditionNotRunning)
	select {
	case err := <-errCh:
		if err != nil {
			// Check if the error is due to context timeout (TLE)
			if timeoutCtx.Err() == context.DeadlineExceeded {
				return &models.ExecutionResult{
					TimeLimitExceeded: true,
				}, nil
			}
			return nil, err
		}
	case waitResp := <-statusCh:
		if waitResp.StatusCode == 137 {
			return &models.ExecutionResult{
				MemoryLimitExceeded: true,
			}, nil
		}
	}

	// during reading logs, we should not use timeout context as it will be killed
	logReader, err := d.dockerCli.ContainerLogs(context.Background(), resp.ID, container.LogsOptions{
		ShowStdout: true,
		ShowStderr: true,
	})
	if err != nil {
		return nil, err
	}
	defer logReader.Close()

	// Create buffers to capture stdout and stderr separately
	var stdoutBuf, stderrBuf bytes.Buffer
	// StdCopy reads from logReader, strips Docker headers, and writes clean output to the buffers
	if _, err := stdcopy.StdCopy(&stdoutBuf, &stderrBuf, logReader); err != nil {
		return nil, err
	}

	return &models.ExecutionResult{
		Output: stdoutBuf.String(),
		Error:  stderrBuf.String(),
	}, nil
}

func NewDockerService(dockerCodeFactory factory.DockerCodeFactory) DockerCodeRunService {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}
	return &dockerServiceImpl{
		dockerCli:         cli,
		dockerCodeFactory: dockerCodeFactory,
	}
}
