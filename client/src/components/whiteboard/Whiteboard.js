import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { initSocket } from '../../socket';
import './Whiteboard.css';

export default function Whiteboard() {
    const params = useParams();
    const navigate = useNavigate();
    const currentUser = useSelector((state) => state.auth);

    const [canvasCurrent, setCanvasCurrent] = useState(null);

    const canvasRef = useRef(null);
    const colorsRef = useRef(null);
    const socketRef = useRef();

    useEffect(() => {
        if (!window.localStorage.getItem('dev')) {
            navigate('/');
        }
        document.title = 'Dev Chat+ Draw';

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const colors = document.getElementsByClassName('color');

        const current = {
            color: 'black',
        };

        const init = async () => {
            socketRef.current = await initSocket();
            socketRef.current.on('connect_error', (error) =>
                handleErrors(error)
            );
            socketRef.current.on('connect_failed', (error) =>
                handleErrors(error)
            );
            function handleErrors(error) {
                // eslint-disable-next-line no-console
                console.log('socket error', error);
                alert('Socket connection failed, try again later.');
                // navigate('/');
            }
            socketRef.current.emit('join', {
                roomId: params.boardId,
                username: currentUser.username,
            });
            socketRef.current.on('joined', ({ username, socketId }) => {
                if (username !== currentUser.username) {
                    console.log(`${username} joined the room.`);
                }
                setTimeout(() => {
                    socketRef.current.emit('syncCanvas', {
                        drawingData: canvas.toDataURL(),
                        socketId,
                    });
                }, 1000);
            });
            socketRef.current.on(
                'drawingChange',
                ({ drawingData, socketId }) => {
                    if (socketId) {
                        if (socketId === socketRef.current.id) {
                            const canvas = canvasRef.current;
                            const context = canvas.getContext('2d');
                            context.fillStyle = 'white';
                            context.fillRect(0, 0, canvas.width, canvas.height);
                            const image = new Image();
                            image.onload = function () {
                                context.drawImage(image, 0, 0);
                            };
                            image.src = drawingData;
                        }
                    } else {
                        onDrawingEvent(drawingData);
                    }
                }
            );
        };
        init();

        const onColorUpdate = (e) => {
            current.color = e.target.className.split(' ')[1];
        };

        for (let i = 0; i < colors.length; i++) {
            colors[i].addEventListener('click', onColorUpdate);
        }
        let drawing = false;

        const drawLine = (x0, y0, x1, y1, color, emit) => {
            context.beginPath();
            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
            context.strokeStyle = color;
            if (color === 'white') {
                context.lineWidth = 30;
            } else {
                context.lineWidth = 2;
            }
            context.stroke();
            context.closePath();

            if (!emit) {
                return;
            }

            const w = canvas.width;
            const h = canvas.height;

            socketRef.current.emit('drawingChange', {
                drawingData: {
                    x0: x0 / w,
                    y0: y0 / h,
                    x1: x1 / w,
                    y1: y1 / h,
                    color,
                },
                roomId: params.boardId,
            });
        };

        const onMouseDown = (e) => {
            drawing = true;
            current.x = e.clientX || e.touches[0].clientX;
            current.y = e.clientY || e.touches[0].clientY;
        };

        const onMouseMove = (e) => {
            if (!drawing) {
                return;
            }
            drawLine(
                current.x,
                current.y,
                e.clientX || e.touches[0].clientX,
                e.clientY || e.touches[0].clientY,
                current.color,
                true
            );
            current.x = e.clientX || e.touches[0].clientX;
            current.y = e.clientY || e.touches[0].clientY;
        };

        const onMouseUp = (e) => {
            if (!drawing) {
                return;
            }
            drawing = false;
            drawLine(
                current.x,
                current.y,
                e.clientX || e.touches[0].clientX,
                e.clientY || e.touches[0].clientY,
                current.color,
                true
            );
        };

        const throttle = (callback, delay) => {
            let previousCall = new Date().getTime();
            return function () {
                const time = new Date().getTime();

                if (time - previousCall >= delay) {
                    previousCall = time;
                    callback.apply(null, arguments);
                }
            };
        };

        canvas.addEventListener('mousedown', onMouseDown, false);
        canvas.addEventListener('mouseup', onMouseUp, false);
        canvas.addEventListener('mouseout', onMouseUp, false);
        canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

        canvas.addEventListener('touchstart', onMouseDown, false);
        canvas.addEventListener('touchend', onMouseUp, false);
        canvas.addEventListener('touchcancel', onMouseUp, false);
        canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);

        const onResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', onResize, false);
        onResize();

        const onDrawingEvent = (data) => {
            const w = canvas.width;
            const h = canvas.height;
            drawLine(
                data.x0 * w,
                data.y0 * h,
                data.x1 * w,
                data.y1 * h,
                data.color
            );
        };

        return () => {
            socketRef.current?.disconnect();
            socketRef.current?.off('joined');
            socketRef?.current.off('drawingChange');
            socketRef.current?.off('connect_error');
            socketRef.current?.off('connect_failed');
            socketRef?.current.off('syncDrawing');
        };
    }, []);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#fff';
        context.fillRect(0, 0, canvas.width, canvas.height);
    };

    const downloadCanvas = () => {
        const canvas = canvasRef.current;
        setCanvasCurrent(canvas.toDataURL());
        const image = canvas.toDataURL('png');
        const link = document.createElement('a');
        const time = new Date();
        const imageName = time.toISOString();
        link.download = `${params.boardId}-${imageName}.png`;
        link.href = image;
        link.click();

        setTimeout(() => {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            const image = new Image();
            image.onload = function () {
                context.drawImage(image, 0, 0);
            };
            image.src = canvasCurrent;
        }, 2000);
    };

    const leaveBoard = () => {
        window.close();
    };

    return (
        <div>
            <canvas ref={canvasRef} className='whiteboard' />
            <div ref={colorsRef} className='colors'>
                <div className='color black' />
                <div className='color red' />
                <div className='color green' />
                <div className='color blue' />
                <div className='color yellow' />
                <div className='color white' />
                <button onClick={clearCanvas}>clear</button>
                <button onClick={downloadCanvas}>Save as image</button>
                <button onClick={leaveBoard}>Leave </button>
            </div>
        </div>
    );
}