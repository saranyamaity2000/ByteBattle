package services

import (
	"fmt"

	"maitysaranya.com/EvaluatorService/Internal/models"
)

type SubmissionService struct{}

func (s *SubmissionService) EvaluateSubmission(submission models.ProblemSubmission) (string, error) {
	fmt.Printf("Evaluating submission: %+v\n", submission)
	return "Evaluation Result", nil
}
