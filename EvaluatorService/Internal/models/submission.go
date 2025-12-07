package models

import (
	"time"

	"maitysaranya.com/EvaluatorService/Internal/models/lang"
)

// generic submission models

type ProblemSubmission struct {
	SubmissionID string        `json:"submissionId"`
	ProblemID    string        `json:"problemId"`
	Code         string        `json:"code"`
	Language     lang.Language `json:"lang"`
}

type ProblemConstraint struct {
	TimeLimit     time.Duration // in seconds
	MemoryLimitMB int64         // in MegaBytes
}

type ExecutionResult struct {
	Output              string
	Error               string
	TimeLimitExceeded   bool
	MemoryLimitExceeded bool
}

// problem client related models

type ProblemTestCase struct {
	Input  string `json:"input"`
	Output string `json:"output"`
}

// Submission Client related models
type SubmissionStatus string

const (
	StatusPending   SubmissionStatus = "pending"
	StatusRunning   SubmissionStatus = "processing"
	StatusCompleted SubmissionStatus = "completed"
	StatusFailed    SubmissionStatus = "failed"
)

type Verdict string

const (
	VerdictAccepted            Verdict = "ACCEPTED"
	VerdictWrongAnswer         Verdict = "WRONG_ANSWER"
	VerdictTimeLimitExceeded   Verdict = "TIME_LIMIT_EXCEEDED"
	VerdictMemoryLimitExceeded Verdict = "MEMORY_LIMIT_EXCEEDED"
	VerdictRuntimeError        Verdict = "RUNTIME_ERROR"
	VerdictCompilationError    Verdict = "COMPILATION_ERROR"
)

type SubmissionResult struct {
	Verdict         string  `json:"verdict"`
	Score           float64 `json:"score,omitempty"`
	ExecutionTime   float64 `json:"executionTime,omitempty"`
	MemoryUsed      float64 `json:"memoryUsed,omitempty"`
	TestCasesPassed int     `json:"testCasesPassed,omitempty"`
	TotalTestCases  int     `json:"totalTestCases,omitempty"`
	Error           string  `json:"error,omitempty"`
}
type SubmissionStatusUpdateDTO struct {
	Result *SubmissionResult `json:"result"`
	Status string            `json:"status"`
}
