package models

import (
	"time"

	"maitysaranya.com/EvaluatorService/Internal/models/lang"
)

type ProblemSubmission struct {
	SubmissionID string        `json:"submissionId"`
	ProblemID    string        `json:"problemId"`
	Code         string        `json:"code"`
	Language     lang.Language `json:"lang"`
}

type ProblemConstraint struct {
	TimeLimitSec  time.Duration
	MemoryLimitMB int64 // in MegaBytes
}

type ExecutionResult struct {
	Output              string
	Error               string
	TimeLimitExceeded   bool
	MemoryLimitExceeded bool
}

type ProblemTestCase struct {
	Input  string `json:"input"`
	Output string `json:"output"`
}
