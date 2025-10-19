package services

import (
	"fmt"
	"log"
	"strings"

	"maitysaranya.com/EvaluatorService/Internal/client"
	"maitysaranya.com/EvaluatorService/Internal/models"
)

type EvaluaterService interface {
	EvaluateSubmission(submission models.ProblemSubmission) error
}

type evaluaterServiceImpl struct {
	dockerService DockerCodeRunService
	problemClient client.IProblemClient
}

func (s *evaluaterServiceImpl) EvaluateSubmission(submission models.ProblemSubmission) error {
	fmt.Printf("Evaluating submission: ID=%s, Language=%s\n", submission.SubmissionID, submission.Language)
	problemTestcases, err := s.problemClient.GetTestcases(submission.ProblemID)
	if err != nil {
		return fmt.Errorf("failed to get testcases: %w", err)
	}
	testcasesPassed := 0
	for testIndex, testcase := range problemTestcases {
		result, err := s.dockerService.RunCodeInContainer(submission.Language, submission.Code, testcase.Input, models.ProblemConstraint{ // TODO: get constraint from problem
			TimeLimitSec:  2,   // Example time limit
			MemoryLimitMB: 256, // Example memory limit in MB
		})
		if err != nil {
			return fmt.Errorf("failed to run code in container: %w", err)
		}

		// TODO: Handle the result in a separate function + update the submission status through Submission Client (to be added)
		if result.TimeLimitExceeded {
			return fmt.Errorf("time limit exceeded")
		} else if result.MemoryLimitExceeded {
			return fmt.Errorf("memory limit exceeded")
		} else if result.Error != "" {
			fmt.Printf("Testcase failed: %s\n", result.Error)
		}

		expected := strings.TrimRight(testcase.Output, "\r\n")
		got := strings.TrimRight(result.Output, "\r\n")
		if expected != got {
			fmt.Printf("Testcase %d Failed: expected %q, got %q\n", testIndex+1, expected, got)
		} else {
			testcasesPassed++
		}
	}
	log.Printf("Testcases passed: %d/%d\n", testcasesPassed, len(problemTestcases))
	return nil
}

func NewEvaludaterService(dockerService DockerCodeRunService, problemClient client.IProblemClient) EvaluaterService {
	return &evaluaterServiceImpl{
		dockerService: dockerService,
		problemClient: problemClient,
	}
}
