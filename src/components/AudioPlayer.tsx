"use client";

import React, {useEffect, useRef, useState} from "react";
import {Play, Pause, Loader2, SkipBack, SkipForward} from "lucide-react";
import {motion, AnimatePresence} from "framer-motion";

// Generate stable waveform data outside component
const WAVEFORM_BARS = Array.from({length: 20}, (_, i) => ({
    id: `waveform-bar-${i}`,
    index: i,
}));

export default function AudioPlayer({src}: { src: string }) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onTimeUpdate = () => setProgress(audio.currentTime);
        const onLoaded = () => {
            setDuration(audio.duration || 0);
            setLoading(false);
        };
        const onEnded = () => setPlaying(false);
        const onWaiting = () => setLoading(true);
        const onPlaying = () => setLoading(false);

        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("loadedmetadata", onLoaded);
        audio.addEventListener("ended", onEnded);
        audio.addEventListener("waiting", onWaiting);
        audio.addEventListener("playing", onPlaying);

        return () => {
            audio.removeEventListener("timeupdate", onTimeUpdate);
            audio.removeEventListener("loadedmetadata", onLoaded);
            audio.removeEventListener("ended", onEnded);
            audio.removeEventListener("waiting", onWaiting);
            audio.removeEventListener("playing", onPlaying);
        };
    }, []);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (playing) {
            audio.pause();
        } else {
            /* 处理 play() 返回的 Promise，避免控制台警告 */
            void audio.play().catch((err) => {
                // 典型错误：NotAllowedError (浏览器阻止自动播放)
                console.warn("播放失败：", err);
                setPlaying(false);
            });
        }
        setPlaying(!playing);
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;
        const value = Number(e.target.value);
        audio.currentTime = value;
        setProgress(value);
    };


    const skip = (seconds: number) => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
    };

    return (
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5}}
            className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-black p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 backdrop-blur-xl"
        >
            <audio ref={audioRef} src={src} className="hidden"/>

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, gray 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}/>
            </div>

            {/* Waveform Visualization */}
            <div className="flex items-center justify-center h-24 mb-6 gap-1">
                {WAVEFORM_BARS.map((bar) => (
                    <motion.div
                        key={bar.id}
                        animate={{
                            height: playing ? ["20%", `${20 + (bar.index % 3) * 25 + 30}%`, "20%"] : "20%",
                        }}
                        transition={{
                            duration: playing ? 1.5 + (bar.index % 5) * 0.1 : 0.3,
                            repeat: playing ? Infinity : 0,
                            ease: "easeInOut",
                            delay: playing ? bar.index * 0.05 : 0,
                        }}
                        className="w-1 bg-gradient-to-t from-gray-400 to-gray-600 dark:from-gray-600 dark:to-gray-400 rounded-full"
                        style={{minHeight: '20%'}}
                    />
                ))}
            </div>

            {/* Control Panel */}
            <div className="space-y-6">
                {/* Progress Bar */}
                <div className="relative">
                    <div className="relative h-12 flex items-center">
                        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-gray-400 to-gray-600 dark:from-gray-600 dark:to-gray-400"
                                style={{width: `${(progress / duration) * 100 || 0}%`}}
                                layoutId="progress"
                            />
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={duration}
                            value={progress}
                            onChange={handleProgressChange}
                            className="relative w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <motion.div
                            className="absolute bg-white dark:bg-gray-900 border-2 border-gray-600 dark:border-gray-400 rounded-full shadow-lg"
                            style={{
                                left: `${(progress / duration) * 100 || 0}%`,
                                width: '20px',
                                height: '20px',
                                x: '-50%',
                            }}
                            whileHover={{scale: 1.2}}
                            whileTap={{scale: 0.9}}
                        />
                    </div>

                    {/* Time Display */}
                    <div className="flex justify-between mt-2 text-sm font-mono">
                        <motion.span
                            key={`time-current-${Math.floor(progress)}`}
                            initial={{opacity: 0.5}}
                            animate={{opacity: 1}}
                            className="text-gray-600 dark:text-gray-400"
                        >
                            {formatTime(progress)}
                        </motion.span>
                        <motion.span
                            key={`time-duration-${Math.floor(duration)}`}
                            initial={{opacity: 0.5}}
                            animate={{opacity: 1}}
                            className="text-gray-600 dark:text-gray-400"
                        >
                            {formatTime(duration)}
                        </motion.span>
                    </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-center gap-4">
                    <motion.button
                        whileHover={{scale: 1.1}}
                        whileTap={{scale: 0.9}}
                        onClick={() => skip(-10)}
                        className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    >
                        <SkipBack className="w-5 h-5"/>
                    </motion.button>

                    <motion.button
                        whileHover={{scale: 1.1}}
                        whileTap={{scale: 0.9}}
                        onClick={togglePlay}
                        disabled={loading}
                        className="relative p-4 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-200 dark:to-white text-white dark:text-gray-900 shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50"
                    >
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div
                                    key="loader"
                                    initial={{opacity: 0, rotate: 0}}
                                    animate={{opacity: 1, rotate: 360}}
                                    exit={{opacity: 0}}
                                    transition={{rotate: {duration: 1, repeat: Infinity, ease: "linear"}}}
                                >
                                    <Loader2 className="w-6 h-6"/>
                                </motion.div>
                            ) : playing ? (
                                <motion.div
                                    key="pause"
                                    initial={{opacity: 0, scale: 0}}
                                    animate={{opacity: 1, scale: 1}}
                                    exit={{opacity: 0, scale: 0}}
                                >
                                    <Pause className="w-6 h-6"/>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="play"
                                    initial={{opacity: 0, scale: 0}}
                                    animate={{opacity: 1, scale: 1}}
                                    exit={{opacity: 0, scale: 0}}
                                >
                                    <Play className="w-6 h-6 ml-0.5"/>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>

                    <motion.button
                        whileHover={{scale: 1.1}}
                        whileTap={{scale: 0.9}}
                        onClick={() => skip(10)}
                        className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    >
                        <SkipForward className="w-5 h-5"/>
                    </motion.button>
                </div>

            </div>
        </motion.div>
    );
}

function formatTime(time: number) {
    if (!time || Number.isNaN(time)) return "00:00";
    const m = Math.floor(time / 60)
        .toString()
        .padStart(2, "0");
    const s = Math.floor(time % 60)
        .toString()
        .padStart(2, "0");
    return `${m}:${s}`;
}
