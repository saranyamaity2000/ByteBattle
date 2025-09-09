package services

import (
	"fmt"

	"maitysaranya.com/EvaluatorService/Internal/models"
)

type SubmissionService interface {
	EvaluateSubmission(submission models.ProblemSubmission) (string, error)
}

type submissionServiceImpl struct {
	dockerService DockerService
}

func (s *submissionServiceImpl) EvaluateSubmission(submission models.ProblemSubmission) (string, error) {
	fmt.Printf("Evaluating submission: ID=%v, Language=%v\n", submission.SubmissionID, submission.Language)

	// Use the Docker service to run the code in a container
	// TODO : Implement proper constraints and remaining parts of the logic
	result, err := s.dockerService.RunCodeInContainer(submission.Language, submission.Code, models.ProblemConstraint{})
	if err != nil {
		return "", fmt.Errorf("failed to evaluate submission: %w", err)
	}
	return result, nil
}

func NewSubmissionService(dockerService DockerService) SubmissionService {
	return &submissionServiceImpl{
		dockerService: dockerService,
	}
}
