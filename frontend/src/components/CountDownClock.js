import React, { useEffect, useState } from "react";

const CountdownClock = ({ endDate }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const now = new Date();
        const end = new Date(endDate);
        const difference = end - now;

        if (difference <= 0) {
            return { expired: true };
        }

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / (1000 * 60)) % 60),
            seconds: Math.floor((difference / 1000) % 60),
            expired: false,
        };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [endDate]);

    if (timeLeft.expired) {
        return <div style={{ color: "red", fontWeight: "bold" }}>Discussion period has ended!</div>;
    }

    return (
        <div style={{ fontSize: "16px", fontWeight: "bold", textAlign: "center" }}>
            <p>Time For Discussion to end</p>
            <span>{timeLeft.days}d </span>
            <span>{timeLeft.hours}h </span>
            <span>{timeLeft.minutes}m </span>
            <span>{timeLeft.seconds}s</span>
        </div>
    );
};

export default CountdownClock;
