package services

import (
	"fmt"
	"log"
	"strings"
	"time"

	"maitysaranya.com/EvaluatorService/Internal/client"
	"maitysaranya.com/EvaluatorService/Internal/models"
	"maitysaranya.com/EvaluatorService/Internal/utility"
)

type EvaluaterService interface {
	EvaluateSubmission(submission models.ProblemSubmission) error
}

type evaluaterServiceImpl struct {
	dockerService    DockerCodeRunService
	problemClient    client.IProblemClient
	submissionClient client.ISubmissionClient
}

func (s *evaluaterServiceImpl) EvaluateSubmission(submission models.ProblemSubmission) error {
	fmt.Printf("Evaluating submission: ID=%s, Language=%s\n", submission.SubmissionID, submission.Language)
	problemTestcases, err := s.problemClient.GetTestcases(submission.ProblemID)
	if err != nil {
		return fmt.Errorf("failed to get testcases: %w", err)
	}

	for testIndex, testcase := range problemTestcases {
		result, err := s.dockerService.RunCodeInContainer(submission.Language, submission.Code, testcase.Input, models.ProblemConstraint{ // TODO: get constraint from problem
			TimeLimit:     2 * time.Second, // TODO: move to config
			MemoryLimitMB: 256,             // TODO: move to config
		})
		if err != nil {
			return s.submissionClient.MarkFailed(submission.SubmissionID, err.Error())
		}

		// TODO: Handle the result in a separate function + update the submission status through Submission Client (to be added)
		if result.TimeLimitExceeded {
			return s.submissionClient.MarkTimeLimitExceeded(submission.SubmissionID)
		} else if result.MemoryLimitExceeded {
			return s.submissionClient.MarkMemoryLimitExceeded(submission.SubmissionID)
		} else if result.Error != "" {
			errorType := utility.If(result.Output == "CS\n", "Runtime Error", "Compilation Error") // CS Stands for Compilation Success
			if errorType == "Runtime Error" {
				return s.submissionClient.MarkCompilationError(submission.SubmissionID, result.Error)
			} else {
				return s.submissionClient.MarkRuntimeError(submission.SubmissionID, result.Error)
			}
		} else {
			expected := strings.TrimRight(testcase.Output, "\r\n")
			got := strings.TrimRight(strings.TrimPrefix(result.Output, "CS\n"), "\r\n")
			if expected != got {
				return s.submissionClient.MarkWrongAnswer(submission.SubmissionID, fmt.Sprintf("Failed at testcase #%d", testIndex+1), fmt.Sprintf("Expected Output:\n %q,\nReceived Output:\n %q", expected, got))
			}
		}
	}
	log.Println("All testcases passed")
	return s.submissionClient.MarkAccepted(submission.SubmissionID)
}

func NewEvaludaterService(dockerService DockerCodeRunService, problemClient client.IProblemClient, submissionClient client.ISubmissionClient) EvaluaterService {
	return &evaluaterServiceImpl{
		dockerService:    dockerService,
		problemClient:    problemClient,
		submissionClient: submissionClient,
	}
}
