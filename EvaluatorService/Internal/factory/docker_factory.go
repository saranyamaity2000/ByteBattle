package factory

import (
	"fmt"

	"maitysaranya.com/EvaluatorService/Internal/models/lang"
)

type DockerCodeFactory interface {
	GetImageForLanguage(language lang.Language) (string, error)
	GetCommandForLanguage(language lang.Language, code string, input string) ([]string, error)
}

type dockerCodeFactoryImpl struct {
	languageToImage map[lang.Language]string
}

func (d *dockerCodeFactoryImpl) GetImageForLanguage(language lang.Language) (string, error) {
	image, exists := d.languageToImage[language]
	if !exists {
		return "", fmt.Errorf("unsupported language: %s", language)
	}
	return image, nil
}

func (d *dockerCodeFactoryImpl) GetCommandForLanguage(language lang.Language, code string, input string) ([]string, error) {
	switch language {
	case lang.Python3:
		return []string{
			"/bin/sh", "-c",
			fmt.Sprintf("echo '%s' > /tmp/code.py && echo '%s' > /tmp/input.txt && echo 'CS' && python3 /tmp/code.py < /tmp/input.txt",
				code,
				input,
			),
		}, nil
	case lang.CPlusPlus:
		return []string{
			"/bin/sh", "-c",
			fmt.Sprintf(
				"echo '%s' > /tmp/code.cpp && echo '%s' > /tmp/input.txt && g++ /tmp/code.cpp -o /tmp/a.out && echo 'CS' && /tmp/a.out < /tmp/input.txt",
				code,
				input,
			),
		}, nil
	default:
		return nil, fmt.Errorf("unsupported language: %s", language)
	}
}

func NewDockerCodeFactory() DockerCodeFactory {
	return &dockerCodeFactoryImpl{
		languageToImage: map[lang.Language]string{
			lang.Python3:   "python:3.9-slim",
			lang.CPlusPlus: "gcc:latest",
		},
	}
}
