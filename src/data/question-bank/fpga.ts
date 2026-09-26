import { choice, code, short } from './helpers'

export const fpgaQuestions = [
  code(93, ['verilog'], 'medium', '写一个两级同步流水寄存器，说明 blocking 与 non-blocking 对仿真行为的影响。', `module pipeline (
    input wire clk,
    input wire rst_n,
    input wire [7:0] data_in,
    output reg [7:0] data_out
);
    reg [7:0] stage1;
    always @(posedge clk) begin
        if (!rst_n) begin
            stage1 <= 8'b0;
            data_out <= 8'b0;
        end else begin
            stage1 <= data_in;
            data_out <= stage1;
        end
    end
endmodule`, '非阻塞赋值先求右侧表达式，再在更新阶段写左侧，data_out 得到上周期 stage1，实现流水延迟。若同一过程改为 stage1=data_in; data_out=stage1;，仿真中后一句立即看到新值，失去目标流水语义。常见错误：混用赋值产生竞态、误认为两级用于任何 CDC；本题输入应属于 clk 域。', ['blocking', 'non-blocking', '流水线']),
  short(94, ['verilog'], 'easy', 'Verilog 的 wire、reg 和 SystemVerilog 的 logic 有何区别？reg 一定生成寄存器吗？', 'wire 表示网络连接，reg 可在过程赋值；logic 是 SystemVerilog 常用变量类型。是否产生寄存器由行为和敏感条件决定。', 'assign 常用连续赋值描述组合连接，always 过程可描述组合或时序。reg 出现在完整组合赋值时可综合为组合逻辑，并不必然生成触发器。logic 不能作为允许任意多驱动的万能替代，接口和多驱动网络需使用适当 net 类型。', '误区：类型名直接决定硬件资源。追问 always_comb、always_ff、单驱动要求和四态 X/Z 的仿真意义。', ['wire', 'reg', 'logic', 'assign']),
  choice(95, ['verilog'], 'medium', '组合 always 块中，仅在 en 为 1 时给 q 赋值，没有 else，最可能推导出什么？', 'single', 'C', [
    ['自动在 en 为 0 时赋值为 0', '语言不会替程序补上默认赋值，未赋值路径通常保留前值。'],
    ['必须是上升沿触发器', '该块没有边沿时钟，不能仅因为保留值就当作边沿触发器。'],
    ['透明锁存器 latch', 'en 为 1 更新、为 0 保持旧值，需要存储行为，常导致 latch 推导。'],
    ['完全优化为常数且不会保存状态', 'q 依赖 en 和输入历史，通常不能视为无状态常数。'],
  ], '组合逻辑块应覆盖所有路径，可先给默认值，再按条件覆盖；FSM 可分状态寄存器与完整的下一状态组合逻辑。追问 case default、敏感列表和综合警告。', ['latch', 'always', '状态机']),
  short(96, ['timing-analysis', 'quartus'], 'hard', 'FPGA 时序约束应包含哪些信息？为什么不能通过全局 false path“修复”时序？', '描述时钟、生成时钟及输入输出外部时序，分析 setup/hold；false path 仅用于真实不需同步定时的路径。', 'SDC 中 create_clock 指定周期，set_input_delay/set_output_delay 需要外部器件的最大最小时序依据。跨域时先设计正确协议，再对异步关系和同步链做有依据约束。Quartus 等工具应检查未约束路径、时钟关系和 slack。', '误区：时序报告无错误就代表硬件正确，若路径被错误切断就根本未分析。追问 CDC、multicycle 的配套 hold 约束以及实现后静态时序。', ['SDC', 'setup/hold', 'false path']),
  short(97, ['verilog', 'quartus'], 'medium', 'FPGA 中 RAM/ROM 可以怎样实现？为什么读延迟和读写冲突语义需明确？', '可由寄存器、分布式资源或块存储器实现，工具依代码模板和目标资源推导；不同资源有不同端口和读延迟。', '同步读常利于块 RAM 推导，初始化和双口能力依器件及工具而异。相同地址同时读写可能表现为旧值、新值或未定义，必须按资源手册和配置约定。多端口需求可能导致复制或无法直接映射。', '误区：RTL 数组就一定零延迟读，或所有 FPGA 的 RAM 模式相同。追问 ROM 初始化文件、复位大量存储器对综合结果的影响。', ['RAM', 'ROM', '存储器推导']),
  short(98, ['domestic-fpga', 'verilog', 'timing-analysis'], 'medium', '将 FPGA 设计迁移到国产 FPGA 时，哪些内容不能只靠重新综合解决？FPGA 与 MCU 的开发方式有何区别？', '可综合 RTL 是起点，但时钟、IO、存储器、IP、约束及 CDC 都要重新核对；FPGA 描述并行硬件，MCU 主要执行顺序指令。', '专用 PLL、收发器、RAM、DSP 和厂商 IP 常需替换或适配，确认引脚电压、时钟资源、启动配置和工具支持。重新仿真、综合、布局布线及板级验证。RTL 可移植不代表时间、电气和初始化行为一致。', '误区：Verilog 语法能编译就代表跨厂商功能和时序都一致。追问资源利用、软核替代、测试台复用以及异步复位释放同步。', ['FPGA迁移', '厂商IP', '并行硬件']),
]
