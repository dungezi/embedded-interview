import type { Question } from '../types/question'

export const questions: Question[] = [
  {
    id: 1,
    tags: ['c'],
    type: 'single',
    difficulty: 'easy',
    title: '在 C语言中，哪个关键字用于提示编译器某个对象可能被程序之外的因素修改？',
    options: [
      { id: 'A', text: 'static' },
      { id: 'B', text: 'volatile' },
      { id: 'C', text: 'const' },
      { id: 'D', text: 'typedef' },
    ],
    answer: 'B',
    explanation: 'volatile 常用于内存映射寄存器等对象，要求编译器按实现规定保留相关访问。它不保证操作的原子性，也不能替代线程同步机制。',
    related: ['volatile', '内存映射寄存器', '原子性'],
  },
  {
    id: 2,
    tags: ['stm32', 'cubemx'],
    type: 'single',
    difficulty: 'easy',
    title: '通过 STM32 的 GPIO 寄存器配置引脚前，通常需要先完成哪项操作？',
    options: [
      { id: 'A', text: '使能对应 GPIO 外设的时钟' },
      { id: 'B', text: '启动 ADC 转换' },
      { id: 'C', text: '开启所有中断' },
      { id: 'D', text: '关闭系统时钟' },
    ],
    answer: 'A',
    explanation: '通常应先通过 RCC 使能对应 GPIO 端口的时钟，再配置引脚模式、上下拉和输出参数。具体寄存器与时钟域取决于 STM32 型号。',
    related: ['RCC', 'GPIO初始化'],
  },
  {
    id: 3,
    tags: ['freertos', 'rtos-basics', 'stm32'],
    type: 'multiple',
    difficulty: 'medium',
    title: '在允许调用 FreeRTOS API 的中断优先级范围内，中断服务函数与任务通信时，哪些做法正确？',
    options: [
      { id: 'A', text: '使用 xQueueSendFromISR 发送队列消息' },
      { id: 'B', text: '使用 xSemaphoreGiveFromISR 释放适合中断使用的信号量' },
      { id: 'C', text: '调用 vTaskDelay 等待任务完成' },
      { id: 'D', text: '根据唤醒标志，使用该移植层提供的中断退出调度宏请求切换' },
    ],
    answer: ['A', 'B', 'D'],
    explanation: '中断应使用允许在 ISR 中调用的 FromISR API，且不能阻塞。若唤醒更高优先级任务，应按移植层要求请求调度；互斥量不能通过中断释放。',
    related: ['FromISR API', '中断优先级', '任务调度'],
  },
  {
    id: 4,
    tags: ['linux'],
    type: 'true_false',
    difficulty: 'easy',
    title: 'Linux 中，同一进程的多个线程通常共享该进程的虚拟地址空间。',
    answer: true,
    explanation: '同一进程的线程共享代码、全局数据和堆等资源，但每个线程有自己的执行上下文和栈。访问共享数据时仍需考虑同步。',
    related: ['进程与线程', '共享内存'],
  },
  {
    id: 5,
    tags: ['uart', 'communication-basics'],
    type: 'single',
    difficulty: 'easy',
    title: 'UART 使用 115200 波特率、8N1 格式连续发送数据时，不考虑帧间空闲，理论上每秒最多传输多少字节？',
    options: [
      { id: 'A', text: '115200 字节' },
      { id: 'B', text: '14400 字节' },
      { id: 'C', text: '11520 字节' },
      { id: 'D', text: '5760 字节' },
    ],
    answer: 'C',
    explanation: '8N1 每帧包含 1 个起始位、8 个数据位和 1 个停止位，共 10 位。因此理论数据速率为 115200 / 10 = 11520 字节/秒。',
    related: ['波特率', 'UART帧格式'],
  },
  {
    id: 6,
    tags: ['spi'],
    type: 'multiple',
    difficulty: 'medium',
    title: '关于常见的四线 SPI 通信，哪些描述正确？',
    options: [
      { id: 'A', text: '主机通常提供串行时钟 SCLK' },
      { id: 'B', text: 'MOSI 与 MISO 可以支持全双工传输' },
      { id: 'C', text: '所有设备必须使用相同的固定时钟模式' },
      { id: 'D', text: '通信双方需要匹配 CPOL 和 CPHA 设置' },
    ],
    answer: ['A', 'B', 'D'],
    explanation: '常见四线 SPI 使用 SCLK、MOSI、MISO 和片选信号。CPOL 与 CPHA 定义时钟模式，需依据从设备要求配置；不同设备可能要求不同模式。',
    related: ['CPOL', 'CPHA', '全双工'],
  },
  {
    id: 7,
    tags: ['i2c'],
    type: 'true_false',
    difficulty: 'easy',
    title: '常规 I2C 总线的 SDA 和 SCL 使用开漏或开集电极方式，并依靠上拉电阻获得高电平。',
    answer: true,
    explanation: '设备主动拉低总线，释放后由上拉电阻拉高。这种连接方式支持线与行为，可用于仲裁和时钟延展。上拉阻值需要结合总线电容和速度选择。',
    related: ['开漏输出', '上拉电阻', '总线仲裁'],
  },
  {
    id: 8,
    tags: ['can', 'communication-basics'],
    type: 'short_answer',
    difficulty: 'medium',
    title: '两个节点同时发送具有不同标识符的标准 CAN 数据帧时，如何通过仲裁决定谁继续发送？',
    answer: 'CAN 使用逐位、非破坏性仲裁。显性位 0 覆盖隐性位 1；节点发送隐性位却读到显性位时退出仲裁。对于不同的 11 位标准数据帧标识符，数值较小的标识符优先级更高，获胜节点继续发送。',
    explanation: '标识符从高位开始参与仲裁，首次出现不同位时即可决定胜负。失败节点转为接收并等待后续重发，获胜帧不会因正常仲裁而被破坏。',
    related: ['显性位与隐性位', '非破坏性仲裁'],
  },
  {
    id: 9,
    tags: ['pcb-layout', 'pcb-routing', 'emc'],
    type: 'short_answer',
    difficulty: 'medium',
    title: 'PCB 上，为什么芯片电源引脚附近通常需要放置去耦电容？布局布线时应注意什么？',
    answer: '去耦电容为芯片瞬态电流提供局部路径并降低电源高频噪声。应靠近电源和地引脚放置，缩短连接、减小电流回路面积，并保持低阻抗的接地路径；容量和数量应结合器件建议及供电需求确定。',
    explanation: '走线和过孔具有寄生电感，较长的供电回路会削弱高频去耦效果。布局需同时考虑电源路径、回流路径和参考平面的连续性。',
    related: ['去耦', '回流路径', '寄生电感'],
  },
  {
    id: 10,
    tags: ['verilog', 'timing-analysis', 'digital-circuits'],
    type: 'code',
    difficulty: 'hard',
    title: '使用 Verilog 编写双触发器同步器，将单比特异步电平 async_in 同步到 clk 域。使用低有效同步复位 rst_n，并说明其适用范围。',
    answer: `module bit_synchronizer (
  input wire clk,
  input wire rst_n,
  input wire async_in,
  output wire sync_out
);
  reg sync_stage1;
  reg sync_stage2;

  always @(posedge clk) begin
    if (!rst_n) begin
      sync_stage1 <= 1'b0;
      sync_stage2 <= 1'b0;
    end else begin
      sync_stage1 <= async_in;
      sync_stage2 <= sync_stage1;
    end
  end

  assign sync_out = sync_stage2;
endmodule

适用于保持时间足够长的单比特电平跨时钟域传输。它降低亚稳态传播概率，但不能保证捕获窄脉冲，也不能用于保证多比特总线的一致性。`,
    explanation: '非阻塞赋值使第二级采样第一级上一周期的值，为亚稳态恢复提供时间。实际 FPGA 实现还应按器件工具要求标记同步寄存器并设置合理的跨时钟域约束；脉冲和多比特数据通常需要握手或异步 FIFO 等方案。',
    related: ['跨时钟域', '亚稳态', '非阻塞赋值'],
  },
]
