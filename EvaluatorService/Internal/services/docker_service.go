package services

import (
	"log"

	"github.com/docker/docker/client"
	"maitysaranya.com/EvaluatorService/Internal/factory"
	"maitysaranya.com/EvaluatorService/Internal/models"
	"maitysaranya.com/EvaluatorService/Internal/models/lang"
)

type DockerService interface {
	PullImageIfNotExists(imageName string) error
	RunCodeInContainer(codeLang lang.Language, code string, constraint models.ProblemConstraint) (string, error)
}

type dockerServiceImpl struct {
	dockerCodeFactory factory.DockerCodeFactory
	dockerClient      *client.Client
}

func (d *dockerServiceImpl) PullImageIfNotExists(imageName string) error {
	// TODO: Implement image pulling logic
	return nil
}

func (d *dockerServiceImpl) RunCodeInContainer(codeLang lang.Language, code string, constraint models.ProblemConstraint) (string, error) {
	// TODO: Implement container running logic
	log.Printf("Running code in container with language %s\n", codeLang.String())
	return "", nil
}

func NewDockerService(dockerCodeFactory factory.DockerCodeFactory) DockerService {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}
	return &dockerServiceImpl{
		dockerClient:      cli,
		dockerCodeFactory: dockerCodeFactory,
	}
}
