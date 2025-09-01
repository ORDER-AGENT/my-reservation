'use client';

import React from 'react';
import { useIsMobile } from '@/hooks/useMediaQuery';

interface ReservationStepIndicatorProps {
  currentStep: number;
}

const stepNames = [
  'メニュー選択',
  'スタッフ選択',
  '日時選択',
  'お客様情報入力',
  '確認',
];

export default function ReservationStepIndicator({ currentStep }: ReservationStepIndicatorProps) {
  const isMobile = useIsMobile();
  const totalSteps = stepNames.length;

  if (isMobile) {
    // サークルインジケーターの計算
    // 半径を 15.9155 にすると円周が約100になるため、進捗率の計算が容易になる
    const circumference = 2 * Math.PI * 15.9155;
    const strokeDashoffset = circumference * (1 - currentStep / totalSteps);

    return (
      <div className="flex justify-start items-center p-2 pl-4 space-x-4 border-b shadow-sm ">
        <div className="relative w-16 h-16">
          {/* サークル型の進捗インジケーター */}
          <svg className="w-full h-full" viewBox="0 0 36 36">
            {/* 背景の円 */}
            <path
              className="text-gray-200"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            {/* 進捗を示す円 */}
            <path
              className="text-primary transition-all duration-300 ease-in-out"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="relative -top-1 text-2xl font-bold text-primary">{currentStep}</span>
            <span className="text-sm text-gray-500">/</span>
            <span className="text-sm text-gray-500">{totalSteps}</span>
          </div>
        </div>
        <div className="text-xl font-bold text-gray-700">
          {stepNames[currentStep - 1]}
        </div>
      </div>
    );
  }

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
          capsuleClasses += " bg-primary border-primary text-white -translate-y-2";
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
