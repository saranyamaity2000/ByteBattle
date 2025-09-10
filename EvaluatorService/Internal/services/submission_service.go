package services

import (
	"fmt"
	"log"

	"maitysaranya.com/EvaluatorService/Internal/models"
)

type SubmissionService interface {
	EvaluateSubmission(submission models.ProblemSubmission) (string, error)
}

type submissionServiceImpl struct {
	dockerService DockerCodeRunService
}

func (s *submissionServiceImpl) EvaluateSubmission(submission models.ProblemSubmission) (string, error) {
	fmt.Printf("Evaluating submission: ID=%s, Language=%s\n", submission.SubmissionID, submission.Language)

	// Use the Docker service to run the code in a container
	// TODO : Implement proper constraints and remaining parts of the logic
	result, err := s.dockerService.RunCodeInContainer(submission.Language, submission.Code, models.ProblemConstraint{
		TimeLimitSec:  2,   // Example time limit
		MemoryLimitMb: 256, // Example memory limit in MB
	})
	if err != nil {
		return "", fmt.Errorf("failed to evaluate submission: %w", err)
	}
	log.Printf("Evaluation result for submission %s: %s", submission.SubmissionID, result)
	return result, nil
}

func NewSubmissionService(dockerService DockerCodeRunService) SubmissionService {
	return &submissionServiceImpl{
		dockerService: dockerService,
	}
}
