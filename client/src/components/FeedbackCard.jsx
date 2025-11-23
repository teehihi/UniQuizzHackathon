import React from 'react';

const FeedbackCard = ({ quote, name, role, bgColor }) => (
    <div className="w-full p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 h-full flex flex-col transition-colors duration-200 hover:shadow-xl dark:hover:shadow-gray-900/70">
        
        {/* Quote */}
        <p className="text-gray-700 dark:text-gray-300 text-base italic mb-6 leading-relaxed grow">
            "{quote}"
        </p>

        {/* Author Info */}
        <div className="flex items-left mt-auto">
            {/* Avatar */}
            <div
                className={`w-12 h-12 ${bgColor} dark:opacity-80 rounded-full flex items-center justify-center mr-4 overflow-hidden shrink-0`}
            >
                <img
                    src="/avatar-placeholder.jpg"
                    alt={`Avatar của ${name}`}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Name + Role */}
            <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100 text-left">{name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{role}</p>
            </div>
        </div>

    </div>
);

export default FeedbackCard;
