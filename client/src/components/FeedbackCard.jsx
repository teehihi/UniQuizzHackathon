import React from 'react';

const FeedbackCard = ({ quote, name, role, bgColor }) => (
    <div className="w-full p-6 bg-white rounded-xl shadow-lg border border-gray-100 h-full flex flex-col">
        
        {/* Quote */}
        <p className="text-gray-700 text-base italic mb-6 leading-relaxed grow">
            "{quote}"
        </p>

        {/* Author Info */}
        <div className="flex items-left mt-auto">
            {/* Avatar */}
            <div
                className={`w-12 h-12 ${bgColor} rounded-full flex items-center justify-center mr-4 overflow-hidden shrink-0`}
            >
                <img
                    src="/avatar-placeholder.jpg"
                    alt={`Avatar của ${name}`}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Name + Role */}
            <div>
                <p className="font-semibold text-gray-800 text-left">{name}</p>
                <p className="text-sm text-gray-500">{role}</p>
            </div>
        </div>

    </div>
);

export default FeedbackCard;
