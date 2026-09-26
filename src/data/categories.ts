import type { Category } from '../types/category'

// 分类仅描述知识结构；全选行为由未来的页面根据 tags 动态处理。
export const categories: Category[] = [
  {
    id: 'programming',
    name: '编程基础',
    tags: [
      { id: 'c', name: 'C语言' },
      { id: 'cpp', name: 'C++' },
      { id: 'data-structures', name: '数据结构' },
      { id: 'algorithms', name: '算法' },
    ],
  },
  {
    id: 'mcu-processors',
    name: 'MCU与处理器',
    tags: [
      { id: 'stm32', name: 'STM32' },
      { id: 'esp32', name: 'ESP32' },
      { id: 'arm', name: 'ARM' },
      { id: 'risc-v', name: 'RISC-V' },
      { id: 'cubemx', name: 'CubeMX' },
    ],
  },
  {
    id: 'rtos',
    name: 'RTOS',
    tags: [
      { id: 'rtos-basics', name: 'RTOS基础' },
      { id: 'freertos', name: 'FreeRTOS' },
    ],
  },
  {
    id: 'operating-systems',
    name: '操作系统',
    tags: [
      { id: 'linux', name: 'Linux' },
      { id: 'driver-development', name: '驱动开发' },
      { id: 'shell', name: 'Shell' },
    ],
  },
  {
    id: 'communication-protocols',
    name: '通信协议',
    tags: [
      { id: 'communication-basics', name: '通信基础' },
      { id: 'uart', name: 'UART' },
      { id: 'spi', name: 'SPI' },
      { id: 'i2c', name: 'I2C' },
      { id: 'can', name: 'CAN' },
      { id: 'ble', name: 'BLE' },
    ],
  },
  {
    id: 'hardware-design',
    name: '硬件设计',
    tags: [
      { id: 'analog-circuits', name: '模拟电路' },
      { id: 'digital-circuits', name: '数字电路' },
      { id: 'power-design', name: '电源设计' },
    ],
  },
  {
    id: 'pcb-design',
    name: 'PCB设计',
    tags: [
      { id: 'schematic', name: '原理图' },
      { id: 'pcb-layout', name: 'PCB布局' },
      { id: 'pcb-routing', name: '布线' },
      { id: 'emc', name: 'EMC' },
    ],
  },
  {
    id: 'fpga',
    name: 'FPGA',
    tags: [
      { id: 'verilog', name: 'Verilog' },
      { id: 'quartus', name: 'Quartus' },
      { id: 'timing-analysis', name: '时序分析' },
      { id: 'domestic-fpga', name: '国产FPGA' },
    ],
  },
  {
    id: 'development-tools',
    name: '工具与开发环境',
    tags: [
      { id: 'keil', name: 'Keil' },
      { id: 'stm32cubeide', name: 'STM32CubeIDE' },
      { id: 'vscode', name: 'VS Code' },
    ],
  },
]
