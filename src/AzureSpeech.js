import React, { useState, useEffect } from 'react';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { ResultReason } from 'microsoft-cognitiveservices-speech-sdk';
import { getTokenOrRefresh } from './utils';

const speechsdk = require('microsoft-cognitiveservices-speech-sdk')

const AzureSpeechToTextUI = () => {
    const [isDisabled, setIsDisabled] = useState(false);
    const [transcribedText, setTranscribedText] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);
    const buttonDisabledTime = 5;

    useEffect(() => {
        let timer;
        if (isDisabled && timeLeft > 0) {
            timer = setTimeout(() => {
                setTimeLeft(prevTime => prevTime - 1);
            }, 1000);
        } else if (timeLeft === 0 && isDisabled) {
            setIsDisabled(false);
        }
        return () => clearTimeout(timer);
    }, [isDisabled, timeLeft]);

    const handleButtonClick = () => {
        speechFromMic();
        setIsDisabled(true);
        setTimeLeft(buttonDisabledTime);
    };

    async function speechFromMic() {
        const tokenObj = await getTokenOrRefresh();
        const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
        speechConfig.speechRecognitionLanguage = 'es-CO';

        const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
        const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);


        recognizer.recognizeOnceAsync(result => {
            if (result.reason === ResultReason.RecognizedSpeech) {
                setTranscribedText(result.text)
            } else {
                setTranscribedText('Lo siento, no he comprendido tu mensaje');
            }
        });
    }

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card>
                        <Card.Header as="h5">Azure Speech-to-Text Demo</Card.Header>
                        <Card.Body>
                            <Button
                                onClick={speechFromMic}
                                variant={isDisabled ? "secondary" : "primary"}
                                className="w-100 mb-3"
                                disabled={isDisabled}
                            >
                                <FaMicrophone className="me-2" />
                                {isDisabled ? "Escuchando..." : "Preguntar"}
                            </Button>
                            {/* {isDisabled && (
                                <ProgressBar 
                                    now={((buttonDisabledTime - timeLeft) / buttonDisabledTime) * 100} 
                                    className="mb-3"
                                />
                            )} */}
                            <Card>
                                <Card.Body style={{ minHeight: '200px', backgroundColor: '#f8f9fa' }}>
                                    <p className="text-muted">
                                        {transcribedText || 'Dime tu pregunta'}
                                    </p>
                                </Card.Body>
                            </Card>
                        </Card.Body>
                    </Card>
                    {/* <Card>
                        <Card.Header as="h5">Azure Speech-to-Text Demo</Card.Header>
                        <Card.Body>
                            <Button
                                onClick={speechFromMic}
                                variant={isDisabled ? "secondary" : "primary"}
                                className="w-100 mb-3"
                                disabled={isDisabled}
                            >
                                <FaMicrophone className="me-2" />
                                {isDisabled ? "Escuchando..." : "Preguntar"}
                            </Button>
                            <Card>
                                <Card.Body style={{ minHeight: '200px', backgroundColor: '#f8f9fa' }}>
                                    <p className="text-muted">
                                        {transcribedText || 'Dime tu pregunta'}
                                    </p>
                                </Card.Body>
                            </Card>
                        </Card.Body>
                    </Card> */}
                </Col>
            </Row>
        </Container>
    );
};

export default AzureSpeechToTextUI;