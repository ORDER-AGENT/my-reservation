'use client';

import React from 'react';

interface ReservationStepIndicatorProps {
  currentStep: number;
}

const stepNames = [
  'メニュー選択',
  'スタッフ選択',
  '日時選択',
  '確認',
//  '完了',
];

export default function ReservationStepIndicator({ currentStep }: ReservationStepIndicatorProps) {
  return (
    <div className="flex justify-center items-center p-4 pt-6">
      {stepNames.map((name, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        let capsuleClasses = "flex items-center space-x-1 pl-4 pr-4 py-1 border-2 rounded-full relative transition-all duration-300 ease-in-out";
        let numberTextClasses = "text-sm";
        let nameTextClasses = "text-sm";

        const zIndex = stepNames.length - index + (isActive ? 5 : 0);

        if (isActive) {
          capsuleClasses += " scale-105";
          capsuleClasses += " bg-blue-500 border-blue-500 text-white -translate-y-2";
          numberTextClasses += " font-bold";
          nameTextClasses += " font-bold";
        } else {
          capsuleClasses += " scale-90";
          if (isCompleted) {
            capsuleClasses += " bg-gray-300 border-gray-400 text-gray-500";
          } else {
            capsuleClasses += " bg-white border-gray-300 text-gray-500";
          }
        }

        return (
          <div
            key={name}
            className={capsuleClasses}
            style={{ marginLeft: index > 0 ? '-20px' : '0', zIndex: zIndex }}
          >
            <span className={numberTextClasses}>{stepNumber}.</span>
            <span className={`${nameTextClasses} _whitespace-nowrap`}>{name}</span>
          </div>
        );
      })}
    </div>
  );
}