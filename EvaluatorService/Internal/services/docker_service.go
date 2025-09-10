package services

import (
	"context"
	"io"
	"log"
	"os"

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
	// TODO: Implement container running logic
	log.Printf("Running code in container with language %s\n", codeLang.String())
	return "", nil
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
