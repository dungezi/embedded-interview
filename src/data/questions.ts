import type { Question } from '../types/question'

export const questions: Question[] = [
  {
    id: 1,
    tags: ['c'],
    type: 'single',
    difficulty: 'easy',
    title: '在 C语言中，哪个关键字用于提示编译器某个对象可能被程序之外的因素修改？',
    options: [
      { id: 'A', text: 'static', explanation: "static 控制存储期或链接属性，使局部变量跨调用保留值，或限制文件作用域符号的可见范围；它不会要求每次重新读取硬件寄存器。" },
      { id: 'B', text: 'volatile', explanation: "volatile 告知编译器对象可能由外部因素改变，常用于外设寄存器访问；它不提供原子性或互斥保护。" },
      { id: 'C', text: 'const', explanation: "const 限制通过该限定类型进行修改，表达只读约束；它不能防止硬件修改寄存器，也不能替代 volatile，两者可以同时使用。" },
      { id: 'D', text: 'typedef', explanation: "typedef 为已有类型定义别名，便于表达和维护接口；它不改变对象访问或优化语义。" },
    ],
    answer: 'B',
    explanation: '编译器可能合并或消除普通对象的重复访问，而硬件寄存器可能随时变化，因此通常通过 volatile 限定访问。const volatile 可表达软件只读但硬件可变的寄存器。volatile 不保证读改写操作原子化，也不提供线程间的内存同步；并发共享数据仍应使用适当的原子操作、临界区或锁。',
    related: ['volatile', '内存映射寄存器', '原子性'],
  },
  {
    id: 2,
    tags: ['stm32', 'cubemx'],
    type: 'single',
    difficulty: 'easy',
    title: '通过 STM32 的 GPIO 寄存器配置引脚前，通常需要先完成哪项操作？',
    options: [
      { id: 'A', text: '使能对应 GPIO 外设的时钟', explanation: "GPIO 外设通常由 RCC 门控时钟供给，先开启端口时钟才可按器件要求配置模式和输出；应确认端口所在时钟域。" },
      { id: 'B', text: '启动 ADC 转换', explanation: "ADC 用于模拟信号采样，与普通 GPIO 的时钟使能是不同操作；数字输入输出不需要启动 ADC。" },
      { id: 'C', text: '开启所有中断', explanation: "GPIO 可以通过轮询使用，无需开启所有中断。使用 EXTI 时才需配置相关中断，并独立使能 GPIO 时钟。" },
      { id: 'D', text: '关闭系统时钟', explanation: "关闭系统时钟不是 GPIO 初始化步骤，可能破坏处理器和外设运行所需的时钟；应配置并使能目标外设时钟。" },
    ],
    answer: 'A',
    explanation: 'STM32 使用外设时钟门控降低功耗，GPIO 初始化通常先使能 RCC 中对应端口的时钟，再配置输入、输出或复用模式、上下拉、速度和输出类型。具体寄存器及使能后等待要求应查对应型号参考手册。使用复用外设还需配置复用功能及该外设时钟，开启 GPIO 时钟并不等于串口已初始化。',
    related: ['RCC', 'GPIO初始化'],
  },
  {
    id: 3,
    tags: ['freertos', 'rtos-basics', 'stm32'],
    type: 'multiple',
    difficulty: 'medium',
    title: '在允许调用 FreeRTOS API 的中断优先级范围内，中断服务函数与任务通信时，哪些做法正确？',
    options: [
      { id: 'A', text: '使用 xQueueSendFromISR 发送队列消息', explanation: "xQueueSendFromISR 是中断安全的队列发送接口，不会等待队列空位；需检查返回值处理队列已满的情况。" },
      { id: 'B', text: '使用 xSemaphoreGiveFromISR 释放适合中断使用的信号量', explanation: "二值或计数信号量可通过 xSemaphoreGiveFromISR 通知任务；互斥量依赖任务所有权及优先级继承，不能在 ISR 中释放。" },
      { id: 'C', text: '调用 vTaskDelay 等待任务完成', explanation: "vTaskDelay 让当前任务阻塞并交出处理器，而中断没有可阻塞的任务上下文，因此不能在 ISR 中调用。" },
      { id: 'D', text: '根据唤醒标志，使用该移植层提供的中断退出调度宏请求切换', explanation: "若 FromISR API 唤醒更高优先级任务，应依据 pxHigherPriorityTaskWoken 使用移植层的调度宏，如 portYIELD_FROM_ISR，让任务及时执行。" },
    ],
    answer: ['A', 'B', 'D'],
    explanation: 'ISR 应保持短小，通过队列或信号量把后续处理交给任务，使用允许在中断中调用的 FromISR 接口且不阻塞。还需遵守移植层规定的中断优先级限制。应初始化并检查唤醒标志，必要时请求中断退出调度；同时检查发送失败，避免队列溢出导致数据静默丢失。',
    related: ['FromISR API', '中断优先级', '任务调度'],
  },
  {
    id: 4,
    tags: ['linux'],
    type: 'true_false',
    difficulty: 'easy',
    title: 'Linux 中，同一进程的多个线程通常共享该进程的虚拟地址空间。',
    answer: true,
    explanation: '该判断正确。同一进程中的线程通常共享虚拟地址空间，包括代码、全局变量和堆，因此一个线程修改共享对象可能被其他线程观察到。线程各自具有寄存器上下文、执行栈和线程局部存储，但栈仍处于进程地址空间中，不是进程间隔离。嵌入式 Linux 多线程操作共享缓冲区时需使用互斥量或原子同步，避免数据竞争。',
    related: ['进程与线程', '共享内存'],
  },
  {
    id: 5,
    tags: ['uart', 'communication-basics'],
    type: 'single',
    difficulty: 'easy',
    title: 'UART 使用 115200 波特率、8N1 格式连续发送数据时，不考虑帧间空闲，理论上每秒最多传输多少字节？',
    options: [
      { id: 'A', text: '115200 字节', explanation: "115200 表示每秒传输的位数，不能直接作为字节数；还需计入起始位和停止位。" },
      { id: 'B', text: '14400 字节', explanation: "14400 来自 115200 / 8，只计入数据位，忽略每个字符的 1 个起始位和 1 个停止位。" },
      { id: 'C', text: '11520 字节', explanation: "8N1 表示 8 个数据位、无校验、1 个停止位，加上起始位每帧共 10 位，所以 115200 / 10 = 11520 字节/秒。" },
      { id: 'D', text: '5760 字节', explanation: "5760 相当于假设每字节需要 20 位，或使用 57600 波特率；与题目给定的 115200、8N1 不符。" },
    ],
    answer: 'C',
    explanation: '异步 UART 不传输独立时钟线，接收端借助起始位及约定波特率采样。8N1 每帧是 1 个起始位、8 个数据位和 1 个停止位，共 10 位，因此理论上为 11520 字节/秒。实际应用还可能受帧间间隔、协议开销、流控及软件处理速度影响；使用 DMA 可以减少 CPU 搬运负担，但不会突破线路速率。',
    related: ['波特率', 'UART帧格式'],
  },
  {
    id: 6,
    tags: ['spi'],
    type: 'multiple',
    difficulty: 'medium',
    title: '关于常见的四线 SPI 通信，哪些描述正确？',
    options: [
      { id: 'A', text: '主机通常提供串行时钟 SCLK', explanation: "常见主从 SPI 中主机输出 SCLK，为移位和采样提供时序基准，通信速度还需满足从设备规格。" },
      { id: 'B', text: 'MOSI 与 MISO 可以支持全双工传输', explanation: "MOSI 和 MISO 为独立方向的数据线，在时钟驱动下可同时发送和接收；是否使用双向数据取决于设备协议。" },
      { id: 'C', text: '所有设备必须使用相同的固定时钟模式', explanation: "SPI 常见有四种 CPOL/CPHA 组合，并不存在所有设备共同固定的模式；主机可以在不同片选事务之间切换配置。" },
      { id: 'D', text: '通信双方需要匹配 CPOL 和 CPHA 设置', explanation: "CPOL 决定时钟空闲电平，CPHA 决定采样相位。主从配置不匹配可能在数据尚未稳定时采样，导致位错或整帧错误。" },
    ],
    answer: ['A', 'B', 'D'],
    explanation: '常见四线 SPI 使用 SCLK、MOSI、MISO 和片选。CPOL 与 CPHA 决定空闲电平及采样边沿，需与从设备规格匹配。同时应确认位序、最大时钟频率、片选建立与保持时间。全双工只表示线路可同时传输；部分设备的命令阶段返回的数据可能没有意义。',
    related: ['CPOL', 'CPHA', '全双工'],
  },
  {
    id: 7,
    tags: ['i2c'],
    type: 'true_false',
    difficulty: 'easy',
    title: '常规 I2C 总线的 SDA 和 SCL 使用开漏或开集电极方式，并依靠上拉电阻获得高电平。',
    answer: true,
    explanation: '该判断描述的是常规支持线与行为的 I2C 总线。设备拉低线路表示 0，释放线路后由上拉电阻形成 1，因此多个设备同时拉低不会产生推挽高低对抗，支持仲裁及从设备时钟延展。上拉阻值过大会增加上升时间，过小则增加低电平灌电流；应根据总线电容、速度和器件电流能力选择。无时钟延展且仅单控制器等特定配置可允许推挽 SCL，需依据规范和器件限制判断。',
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
