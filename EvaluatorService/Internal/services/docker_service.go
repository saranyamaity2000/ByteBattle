package services

import (
	"github.com/docker/docker/client"
	"maitysaranya.com/EvaluatorService/Internal/factory"
	"maitysaranya.com/EvaluatorService/Internal/models"
)

type DockerService interface {
	PullImageIfNotExists(imageName string) error
	RunCodeInContainer(imageName string, code string, constraint models.ProblemConstraint) (string, error)
}

type dockerServiceImpl struct {
	dockerCodeFactory factory.DockerCodeFactory
	dockerClient      *client.Client
}

func (d *dockerServiceImpl) PullImageIfNotExists(imageName string) error {
	// TODO: Implement image pulling logic
	return nil
}

func (d *dockerServiceImpl) RunCodeInContainer(imageName string, code string, constraint models.ProblemConstraint) (string, error) {
	// TODO: Implement container running logic
	return "", nil
}

func NewDockerService() DockerService {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}
	return &dockerServiceImpl{
		dockerClient: cli,
	}
}
