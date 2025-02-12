"use client";

import React from 'react';

interface OperatePathErrorPath {
  OperatePath: string;
  ErrorPath: string;
}

const paths: OperatePathErrorPath = {
  OperatePath: '/Operate.json',
  ErrorPath: '/Error.json'
};

export default paths;