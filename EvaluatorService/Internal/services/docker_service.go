package services

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"time"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/image"
	"github.com/docker/docker/client"
	"maitysaranya.com/EvaluatorService/Internal/factory"
	"maitysaranya.com/EvaluatorService/Internal/models"
	"maitysaranya.com/EvaluatorService/Internal/models/lang"
)

type DockerCodeRunService interface {
	PullImageByCodingLang(codingLang lang.Language) error
	RunCodeInContainer(codeLang lang.Language, code string, constraint models.ProblemConstraint) (string, error)
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

func (d *dockerServiceImpl) RunCodeInContainer(codeLang lang.Language, code string, constraint models.ProblemConstraint) (string, error) {
	image, err := d.dockerCodeFactory.GetImageForLanguage(codeLang)
	if err != nil {
		return "", err
	}

	cmd, err := d.dockerCodeFactory.GetCommandForLanguage(codeLang, code)
	if err != nil {
		return "", err
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
			Memory: int64(constraint.MemoryLimitMb) * 1024 * 1024, // Convert MB to bytes
		},
		AutoRemove: true, // this will automatically remove container after execution
	}

	// Create container with timeout context
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*time.Duration(constraint.TimeLimitSec))
	defer cancel()

	resp, err := d.dockerCli.ContainerCreate(ctx, containerConfig, hostConfig, nil, nil, "")
	if err != nil {
		return "", err
	}

	// Start the container
	if err := d.dockerCli.ContainerStart(ctx, resp.ID, container.StartOptions{}); err != nil {
		return "", err
	}

	// Wait for container to finish
	statusCh, errCh := d.dockerCli.ContainerWait(ctx, resp.ID, container.WaitConditionNotRunning)
	select {
	case err := <-errCh:
		if err != nil {
			// Check if the error is due to context timeout (TLE)
			if ctx.Err() == context.DeadlineExceeded {
				return "", fmt.Errorf("terminated due to Time Limit Exceeded (TLE)")
			}
			return "", err
		}
	case waitResp := <-statusCh:
		if waitResp.StatusCode == 137 {
			return "", fmt.Errorf("terminated due to Memory Limit Exceeded (MLE)")
		}
	}

	out, err := d.dockerCli.ContainerLogs(ctx, resp.ID, container.LogsOptions{
		ShowStdout: true,
		ShowStderr: true,
	})
	if err != nil {
		return "", err
	}
	defer out.Close()

	output, err := io.ReadAll(out)
	if err != nil {
		return "", err
	}

	return string(output), nil
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
