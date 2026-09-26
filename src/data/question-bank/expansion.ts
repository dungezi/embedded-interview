import type { Question } from '../../types/question'
import { choice, code, judgment, short } from './helpers'

// v0.3 新题只追加 ID；原有题目和本地记录的关联保持不变。
export const expansionQuestions: Question[] = [
  short(121, ['c'], 'easy', 'typedef 与宏定义类型别名有什么区别？枚举适合什么场景？',
    'typedef 由编译器建立类型别名，宏只是预处理文本替换；enum 用具名整数常量表达有限状态，便于阅读和检查。',
    '例如 typedef int *IntPtr; 声明 IntPtr a, b 时两者都是指针；宏 #define IntPtr int * 在 IntPtr a, b 中只有 a 是指针。C 的枚举常用于状态机和错误码，但不能假设其存储宽度固定，也不能直接作为跨设备协议布局。',
    '类型别名不会创建独立的新类型。枚举值的合法范围还需在解析外部输入时检查。追问：函数指针别名、枚举与序列化、C 与 C++ 枚举类型约束有什么差异？', ['typedef', '枚举', '宏替换', '类型别名']),
  choice(122, ['c'], 'medium', '关于 C 的 inline 和 restrict，下列说法哪些正确？', 'multiple', ['B', 'D'], [
    ['inline 保证函数不产生调用指令', 'inline 不强制编译器进行内联展开；优化级别、函数规模和递归等因素都可能使调用保留。'],
    ['static inline 常用于头文件中的小型辅助函数', 'static 为各翻译单元提供内部链接，可避免多个源文件包含头文件时出现同名外部定义冲突。'],
    ['restrict 能在运行时检查指针是否重叠', 'restrict 是程序员给编译器的访问别名约定，不提供运行时检查；违反相关访问规则可能产生未定义行为。'],
    ['满足 restrict 约定可帮助编译器优化访问', '减少潜在别名依赖可有利于向量化和读写重排，但必须确保实际访问符合约定，不能随意为共享缓冲区加 restrict。'],
  ], 'inline 与链接规则是两个问题，C 的外部 inline 规则还依赖语言模式；头文件辅助函数通常选 static inline。restrict 约定涉及被修改对象的访问路径，并非简单禁止两个地址相等。面试可用拷贝函数的重叠缓冲区解释风险。', ['inline', 'restrict', '链接', '别名分析']),
  choice(123, ['c'], 'medium', '以下哪一项一定是 C 的未定义行为？', 'single', 'C', [
    ['对无符号整数最大值加 1', '无符号整数算术按其类型范围取模，这是语言定义的行为，不等于有符号溢出。'],
    ['形成数组末尾之后一位的指针但不解引用', '数组末尾之后一位的指针可用于区间比较和结束标记，形成它本身合法，不能解引用。'],
    ['解引用生命周期已经结束的自动变量地址', '对象生命周期结束后该地址不再提供有效对象，读取它属于未定义行为，即使栈内存看起来尚未变化。'],
    ['用 unsigned char 读取一个存活对象的字节表示', '字符类型可检查对象表示，常用于序列化检查和调试；这不意味着任意其他类型的强制转换都合法。'],
  ], '未定义行为意味着标准不约束结果，不能靠一次调试正常来证明安全。常见来源还有有符号溢出、越界、未排序的冲突修改和数据竞争。嵌入式优化构建中的偶发故障应检查对象生命周期与访问边界。', ['未定义行为', '生命周期', '数组边界']),
  code(124, ['c'], 'medium', '用二级指针实现安全的 realloc 扩容：失败时保留原缓冲区，拒绝零长度和尺寸溢出。',
    `#include <stdlib.h>
#include <stdint.h>
int resize_ints(int **buffer, size_t count) {
    if (buffer == NULL || count == 0 || count > SIZE_MAX / sizeof **buffer)
        return -1;
    int *next = realloc(*buffer, count * sizeof **buffer);
    if (next == NULL) return -1;
    *buffer = next;
    return 0;
}
/* 前提：*buffer 为 NULL 或来自兼容分配器的有效块。
   成功后调用方最终 free(*buffer)，并更新容量；不保留旧别名。 */`,
    '二级指针允许更新调用方地址。临时变量避免 realloc 失败时覆盖原指针导致泄漏；长度乘法必须先检查溢出。成功可能搬迁，旧地址及其内部指针失效。不要依赖 realloc(p,0) 的特殊语义。扩容可能复制旧数据，时间成本与块大小有关，不适合有严格延迟要求的中断。', ['二级指针', 'realloc', '尺寸溢出', '所有权']),
  code(125, ['c'], 'easy', '实现有容量检查的字符串复制：容量包含终止符，不截断，失败返回 -1。',
    `#include <stddef.h>
#include <string.h>
int copy_text(char *dst, size_t capacity, const char *src) {
    if (!dst || !src || capacity == 0) return -1;
    size_t length = strlen(src);
    if (length >= capacity) return -1;
    memmove(dst, src, length + 1);
    return 0;
}
/* src 必须指向可读、以 NUL 结尾的字符串；dst 可写且实际大小至少 capacity。
   memmove 允许源目标重叠，失败时目标保持原样。 */`,
    '字符串长度不含 NUL，实际复制要包含终止符。使用 length >= capacity 避免 length+1 比较溢出的写法。strlen 不能用于未终止的串口数据，后者应使用显式长度接口。复杂度 O(n)，额外空间 O(1)；常见错误是忘记终止符或把 sizeof 指针当作缓冲区容量。', ['字符串处理', '缓冲区容量', 'NUL', 'memmove']),
  short(126, ['cpp'], 'medium', 'std::move 会搬运对象吗？移动构造与拷贝构造有何区别？',
    'std::move 只是把表达式转换成可参与移动重载的值类别；真正的资源转移由移动构造或移动赋值实现。拷贝通常复制资源，移动通常转移所有权。',
    '有合适的移动构造时，可将堆缓冲区指针交给新对象并置空源对象，使源析构仍然安全。没有合适移动重载时可能仍然拷贝；const 对象常不能绑定到通常的非 const 移动参数。移动后的标准库对象通常处于有效但未指定状态，不应假定保留原内容。',
    '嵌入式消息缓冲区可以通过移动减少复制，但小对象移动不一定更快。错误做法是转移指针后仍让两个对象释放同一资源。追问：Rule of Five、noexcept 如何影响容器扩容策略、资源所有权边界。', ['移动语义', 'std::move', '拷贝构造', 'Rule of Five']),
  choice(127, ['cpp', 'data-structures'], 'medium', '关于 std::vector 扩容和迭代器，下列哪些正确？', 'multiple', ['A', 'C'], [
    ['发生重新分配时，原指针、引用和迭代器会失效', '连续存储区搬迁后，旧地址不再表示容器内元素；不能继续向 DMA 提供旧 data() 地址。'],
    ['reserve(n) 会创建 n 个元素', 'reserve 调整容量而不增加 size；创建元素应使用 resize 或插入操作，不能直接访问保留但未构造的元素。'],
    ['提前 reserve 可减少多次增长造成的分配与复制', '容量规划可以降低重复扩容成本，但超过容量仍会重新分配，并不能保证实时路径永久无分配。'],
    ['push_back 总是最坏 O(1)，适合任意硬实时中断', 'push_back 通常摊还 O(1)，某次扩容可能 O(n) 并调用分配器，不能把摊还复杂度当作最坏延迟保证。'],
  ], 'vector 适合连续遍历，但动态容量、地址稳定性和分配延迟必须评估。嵌入式可以使用预分配或固定容量结构。追问：std::array、list 的缓存局部性，以及 ISR 中分配的可预测性。', ['STL', 'vector', '迭代器失效', '摊还复杂度']),
  short(128, ['algorithms', 'data-structures'], 'medium', 'DFS 与 BFS 怎样遍历图？哪一种能找到无权图最少边数路径？',
    'DFS 用递归或栈深入探索，BFS 用队列逐层扩展。无权图中 BFS 首次到达节点的层数就是最少边数，前提是正确维护访问集合。',
    '邻接表实现的时间复杂度均为 O(V+E)，访问集合需要 O(V) 空间。BFS 在入队时标记可避免同一节点反复入队；DFS 适合连通性和拓扑相关分析，但递归深度可能耗尽 MCU 栈。带权最短路不能直接使用普通 BFS。',
    '工程中可用 BFS 查找状态转换的最短操作序列，或用显式栈避免深递归。追问：断开的图要遍历所有起点、有向图环检测需区分访问中与已完成状态、权重何时需要 Dijkstra。', ['DFS', 'BFS', '无权最短路径', '时间复杂度']),
  code(129, ['c', 'data-structures'], 'medium', '实现固定数组环形队列，采用保留一个空槽区分满和空；暂不考虑并发。',
    `#include <stdbool.h>
#include <stddef.h>
#define CAP 8u
typedef struct { int data[CAP]; size_t head, tail; } Ring;
bool push(Ring *q, int value) {
    size_t next = (q->head + 1) % CAP;
    if (next == q->tail) return false;
    q->data[q->head] = value;
    q->head = next;
    return true;
}
bool pop(Ring *q, int *value) {
    if (q->head == q->tail) return false;
    *value = q->data[q->tail];
    q->tail = (q->tail + 1) % CAP;
    return true;
}
/* 初始化 head=tail=0；有效容量 CAP-1，调用参数必须有效。 */`,
    '满条件是下一写位置等于读位置，空条件是两索引相等。操作 O(1)，空间固定 O(CAP)，不使用堆。若 ISR 与任务并发使用，应另行处理原子性、内存顺序和生产消费约束，volatile 本身不够；本题明确只实现串行访问。', ['环形队列', '满空判定', '固定容量', '时间复杂度']),
  judgment(130, ['cpp', 'c'], 'easy', '在 C++ 中使用 extern "C" 声明一个接口，就能自动让任意 C++ 类布局与 C 完全兼容。', false,
    'extern "C" 主要指定语言链接，常用于让 C++ 调用 C 函数，并不保证 C++ 类布局、异常或 STL 类型具有 C ABI。接口应使用明确的 C 可表示类型、句柄和约定好的所有权，禁止异常穿过不支持的边界。追问：头文件中的 __cplusplus 条件编译和跨工具链 ABI。', ['C ABI', 'extern "C"', '语言链接']),
  short(131, ['stm32', 'cubemx'], 'medium', 'STM32 EXTI 中断持续重复触发时，如何检查配置和处理流程？',
    '检查 GPIO 到 EXTI 线的映射、触发边沿、NVIC、外部信号和 pending 标志；按芯片寄存器语义清除挂起并正确处理机械抖动。',
    '常见 STM32 GPIO EXTI 按引脚编号选择线并配置端口源，具体线数量和寄存器随系列变化。进入中断先确认来源，共享 IRQ 要处理相应线。某些挂起位写 1 清除，不能按普通变量读改写。机械按键会产生多次边沿，应在任务或定时器中去抖。',
    '不要在 ISR 中长时间延时去抖，也不要假定配置 NVIC 就完成了 GPIO 路由。追问：边沿发生于清除附近如何避免丢事件、HAL 回调与寄存器级处理的职责，以及是否有电平型中断源。', ['EXTI', '挂起标志', 'GPIO映射', '去抖']),
  choice(132, ['stm32'], 'medium', '测量外部脉冲周期，应优先选择哪种定时器功能？', 'single', 'B', [
    ['仅用软件循环读取 GPIO 并计数', '软件轮询受中断和执行路径影响，精度和 CPU 占用难以控制，不适合优先用于准确测量脉冲周期。'],
    ['输入捕获，将边沿时的计数值锁存', '输入捕获由硬件在边沿发生时锁存计数器，通过相邻捕获值差和计数频率求周期，需要处理溢出。'],
    ['输出比较，以输出翻转次数替代输入时间', '输出比较用于在计数匹配时产生事件或输出，它本身不能记录外部输入边沿时间。'],
    ['把看门狗重装次数作为脉冲频率', '看门狗主要用于故障监测，其重装操作不等同于捕获输入时间，也不能提供所需测量精度。'],
  ], '周期 = 捕获计数差 / 定时器计数频率。高频信号可用 DMA 取捕获序列，低频信号需扩展溢出计数。追问：输入滤波、预分频、双边沿测占空比、计数器回绕和同步延迟。', ['输入捕获', '输出比较', '定时器溢出']),
  short(133, ['stm32', 'power-design'], 'medium', 'RTC 为什么通常使用独立低速时钟和备份域？低功耗后怎样保持时间？',
    'RTC 需要在主系统时钟停止时仍计时，备份域和 VBAT 可在适用器件上保持时间；时钟源、低功耗模式和备份供电决定保持能力。',
    '常见时钟源有外部低速晶振 LSE 和内部低速振荡器 LSI，精度、启动时间和功耗不同。初始化应先判断备份标记，避免每次复位都重设时间。备份域复位或失去供电可能丢失配置；不同 STM32 的低功耗模式与 RTC 保持特性要查手册。',
    '误区是以为所有复位都会清空 RTC 或所有睡眠都自动保留。追问：晶振负载、校准、闰年、读取日期时间的锁存规则、唤醒和闹钟源，以及 VBAT 与主电源切换。', ['RTC', '备份域', 'LSE', 'VBAT']),
  short(134, ['stm32', 'arm'], 'hard', 'Cortex-M Bootloader 跳转应用时，为什么不能只调用应用入口地址？',
    '应用需要正确的初始 MSP、向量表和处理器环境。跳转前校验镜像与地址，停用相关中断和外设，设置适用的向量表及栈，然后进入 Reset_Handler。',
    '典型向量表首项为初始栈，第二项为复位入口；需确认栈处于有效 RAM、入口属于应用且满足 Thumb 状态。清理 SysTick、DMA、挂起 IRQ 与缓存状态，避免旧中断使用新栈。VTOR 支持和对齐要求因内核而异，无 VTOR 时需器件重映射方案。',
    'RTOS 运行后的 PSP、CONTROL 和异常状态使直接跳转更复杂，应设计受控重启路径；更不能从普通 ISR 生搬跳转模板。追问：镜像校验、掉电保护、启动地址映射、链接脚本和恢复机制。', ['Bootloader', '向量表', 'MSP', 'Reset_Handler']),
  short(135, ['arm', 'risc-v'], 'hard', 'ARM Cortex-M 的 CONTROL/xPSR 与 RISC-V CSR 各承担什么角色？',
    'CONTROL 管理 Cortex-M 线程模式的特权和栈选择等状态，xPSR 汇集状态标志和异常编号；RISC-V CSR 用于状态、异常入口及原因等架构控制。',
    'Cortex-M Handler 模式使用 MSP；线程模式可以选择 MSP 或 PSP，非特权线程不能随意恢复特权。xPSR 不是普通通用寄存器。RISC-V 在实现的特权级上通过 CSR 如 mstatus、mtvec、mcause 管理异常，CSR 可用性和权限依赖实现。',
    '不能把两架构寄存器按名字一一硬对应。追问：SVC 与 ecall、非法 CSR 访问、保存上下文、MPU/PMP 内存保护和异常返回。涉及可选功能时必须指定内核型号。', ['CONTROL', 'xPSR', 'CSR', '特权级', 'MPU', 'PMP']),
  short(136, ['esp32'], 'medium', 'ESP-IDF 中 NVS 与 OTA 分别保存什么？怎样降低升级后无法启动的风险？',
    'NVS 用于配置等键值数据，OTA 用应用分区和启动选择元数据管理固件更新；升级应验证镜像并在启用回滚时完成启动自检后确认有效。',
    'NVS 不适合当作大固件镜像仓库，设置值后要按 API 要求 commit。OTA 通常写入非运行的应用分区，完成后设置启动分区；启用回滚的新应用需验证关键功能，再调用确认有效接口。不能把下载成功等同于设备健康启动。',
    '工程上还要处理断电、分区容量、版本兼容和配置迁移。追问：esp_ota_mark_app_valid_cancel_rollback、签名校验、分区表，以及新旧应用读取同一 NVS 时如何兼容。', ['NVS', 'OTA', '回滚', '启动自检']),
  choice(137, ['freertos', 'rtos-basics'], 'medium', 'FreeRTOS 直接任务通知与队列相比，下列哪些正确？', 'multiple', ['A', 'D'], [
    ['可以用通知唤醒指定任务并携带通知值', '通知状态和值属于接收任务，可按更新动作实现计数或位标志等轻量通信，适合明确的接收者。'],
    ['一个通知天然广播给任意多个等待任务', '通知的接收者是特定任务，不具有事件组那样的多等待者广播语义；多任务通知要分别设计。'],
    ['通知值可以直接保存任意长度消息数组', '通知值是有限宽度数值，不是变长数据缓冲；需要队列、流缓冲或其他安全的共享存储承载内容。'],
    ['ISR 中应使用对应的 FromISR 接口并处理唤醒请求', '中断上下文需遵守 API 和中断优先级限制，并根据更高优先级任务是否被唤醒请求适当的上下文切换。'],
  ], '通知可减少对象开销，但不能忽略值覆盖、通知索引和接收语义。任务同时用多个通知用途时应规划可用索引。追问：ulTaskNotifyTake 与 xTaskNotifyWait 的计数/位语义以及事件丢失。', ['任务通知', 'FromISR', '通知值']),
  short(138, ['freertos', 'rtos-basics'], 'medium', 'FreeRTOS heap_1 到 heap_5 有何差异？如何选择？',
    'heap_1 只分配不释放；heap_2 支持释放但不合并相邻空闲块；heap_3 包装库 malloc/free；heap_4 合并相邻空闲块；heap_5 类似 heap_4 并支持多个非连续内存区域。',
    'heap_1 适合启动阶段分配后长期使用；heap_2 的碎片风险需评估。heap_3 依赖工具链分配器；heap_4 的合并可缓解外部碎片但不能消除所有碎片。heap_5 需先定义按地址排序的区域并按 API 要求结束列表。静态分配也可减少运行时不可预测性。',
    '误区是 heap_4 自动移动已分配块或任何堆方案都有固定最坏耗时。追问：剩余量与最低剩余量、失败钩子、对齐、DMA 可访问区域和多核/中断使用限制。', ['heap_1', 'heap_2', 'heap_3', 'heap_4', 'heap_5', '静态分配']),
  judgment(139, ['freertos', 'rtos-basics'], 'medium', '启用 Tickless Idle 就能保证所有任务的实时截止期限，且不需要处理睡眠后的时间补偿。', false,
    'Tickless Idle 在适当的空闲窗口抑制周期 tick 以减少唤醒和功耗，需要正确处理睡眠时长、唤醒源和时间推进。它不替代最坏执行时间、阻塞时间和优先级分析，错误的时钟补偿反而会影响超时准确性。追问：低功耗定时器精度、提前唤醒竞态、tick 回绕以及端口支持。', ['Tickless Idle', '实时性', 'Tick补偿']),
  short(140, ['linux'], 'easy', '子进程退出后为什么可能成为僵尸进程？wait/waitpid 有什么作用？',
    '子进程退出后，内核保留退出状态等信息供父进程读取；父进程未回收时形成僵尸。wait/waitpid 获取状态并释放这部分记录。',
    '僵尸已经不再执行，通常不是仍占用原来全部用户地址空间。父进程应循环处理子进程退出，考虑 EINTR 和多个子进程同时退出；WNOHANG 可用于非阻塞检查。孤儿与僵尸概念不同，孤儿的父进程结束后会被合适的回收者接管。',
    'SIGCHLD 处理策略需要符合目标系统语义，不宜在复杂信号处理函数里做不安全操作。追问：如何解释 WIFEXITED/WEXITSTATUS、信号终止，以及服务程序的子进程管理。', ['waitpid', '僵尸进程', 'SIGCHLD']),
  code(141, ['linux', 'communication-basics'], 'medium', '写一个阻塞 socket 的发送全部数据函数，处理短写和 EINTR；假定 SIGPIPE 已在调用方妥善处理。',
    `#include <sys/socket.h>
#include <errno.h>
#include <stddef.h>
int send_all(int fd, const void *buffer, size_t length) {
    const unsigned char *p = buffer;
    while (length > 0) {
        ssize_t n = send(fd, p, length, 0);
        if (n < 0) {
            if (errno == EINTR) continue;
            return -1;
        }
        if (n == 0) return -1;
        p += n;
        length -= (size_t)n;
    }
    return 0;
}`,
    'send 成功可能只发送部分数据，必须推进指针和剩余长度。EINTR 可重试，其他错误返回失败；这里不声称支持非阻塞 EAGAIN，也不提供超时和部分进度接口。TCP 是字节流，发送完成不代表应用对端处理完成。循环次数与短写有关，无额外与消息长度成比例的缓冲。', ['socket', '短写', 'EINTR', 'SIGPIPE']),
  short(142, ['linux', 'driver-development', 'shell'], 'medium', 'sysfs、procfs 和内核模块工具分别适合做什么？如何定位驱动未加载？',
    'sysfs 主要展示设备模型及属性，procfs 常用于进程和系统信息；lsmod 查看模块，modprobe 处理模块及依赖，dmesg 查看内核诊断。',
    'insmod 直接加载指定模块文件，通常不自动解析依赖；modprobe 使用安装的模块及依赖信息。未加载时检查版本/符号/签名、依赖、设备匹配和 probe 日志。模块已加载也不等于设备成功绑定，需结合 /sys 中设备与驱动关系。',
    '不要把 procfs 当任意新设备属性的默认接口；sysfs 属性通常应清晰、简单且维护 ABI。追问：模块卸载的引用和资源清理、设备树 compatible、权限、grep 与重定向保留诊断。', ['sysfs', 'procfs', 'modprobe', 'lsmod', 'dmesg']),
  choice(143, ['uart', 'communication-basics'], 'easy', 'UART 配置为 115200、8N1，连续发送时理想有效字节速率是多少？', 'single', 'B', [
    ['115200 字节/秒', '115200 指线路的比特速率（常见 UART 二值信号下数值也等于波特率），不能直接当作有效字节速率。'],
    ['11520 字节/秒', '8N1 每字节包含 1 起始位、8 数据位、1 停止位，共 10 位；115200 除以 10 得 11520 字节/秒。'],
    ['14400 字节/秒', '只除以 8 忽略了起始位和停止位开销，得到的是未考虑帧格式的理论数据换算。'],
    ['57600 字节/秒', '全双工表示两个方向可同时传输，不会自动将单方向的帧开销变成两位或把字节速率翻倍。'],
  ], '波特率是符号率，bit rate 是比特率，二值 UART 常数值相同；其他调制不能泛化。USART 还可支持同步时钟模式，具体能力取决于外设。实际有效吞吐还受间隔、流控和软件处理影响。追问：校验位和两停止位如何影响速率。', ['波特率', 'bit rate', '8N1', 'UART与USART']),
  short(144, ['can'], 'medium', 'CAN FD 相比经典 CAN 有哪些变化？bit stuffing 为什么存在？',
    'CAN FD 支持更长数据载荷，最大 64 字节，并可通过 BRS 在数据阶段切换比特率；填充位用于维护同步和满足帧编码规则。',
    '经典 CAN 数据帧最多 8 字节。FD 的仲裁阶段仍需兼容其仲裁时序，数据阶段速率取决于配置、收发器和网络条件。经典 CAN 在适用区域连续五个相同比特后插入反相比特，接收方去除；FD 的 CRC 区域还有不同的填充与检查规则，不能简单照搬。',
    '不能假定任何经典 CAN 控制器都能接收 FD 帧；混合网络需明确兼容模式。追问：DLC 编码、BRS、采样点、总线长度和收发器能力如何限制高速数据阶段。', ['CAN FD', 'BRS', 'bit stuffing', 'DLC']),
  short(145, ['ble'], 'medium', 'BLE GATT 的 UUID、Notification 和 Indication 有什么区别？',
    'UUID 标识服务或特征等属性类型，Notification 没有 ATT 层确认，Indication 需要 ATT 层确认；二者通常要客户端通过 CCCD 订阅。',
    'UUID 不等于属性句柄，句柄定位服务器属性实例。Notification 可连续发送但不能据此断言无线链路完全不可靠，底层连接仍有链路机制；Indication 的确认提供 ATT 层接收确认，并不代表业务处理或持久化完成。',
    '工程选择需考虑吞吐、延迟、应用 ACK 和断线重连。追问：16 位标准 UUID 与 128 位自定义 UUID、MTU 对有效载荷的影响、服务发现和 CCCD 生命周期。', ['UUID', 'Notification', 'Indication', 'CCCD']),
  short(146, ['analog-circuits', 'stm32'], 'medium', 'ADC 前加 RC 滤波为什么可能造成采样误差？如何兼顾滤波和采样保持？',
    'RC 可抑制高频噪声，但串联电阻和信号源阻抗会限制 ADC 采样电容的充电；采样时间不足会导致未充分建立的电压误差。',
    '采样保持输入不是无限高阻的静态负载，采样开关导通时会发生瞬态电荷传输。应根据 ADC 输入模型、采样时间、目标精度和驱动运放能力设计 RC；多通道切换时相邻通道残留也可能影响结果。',
    '不能只凭截止频率决定电阻。追问：延长采样时间、低阻抗缓冲、过采样、抗混叠和电容对运放稳定性的影响；参数应查具体芯片手册。', ['RC滤波', '采样保持', '输入阻抗', '建立时间']),
  choice(147, ['power-design', 'schematic'], 'medium', '关于 Buck、Boost 和储能电容，下列哪些正确？', 'multiple', ['A', 'C'], [
    ['典型 Buck 用于降压，典型 Boost 用于升压', '两种基本拓扑分别用于低于或高于输入的输出，工作范围还受占空比、损耗和器件限制影响。'],
    ['Bulk 电容可以替代所有贴近芯片的高频去耦电容', '大容量电容主要提供低频储能，寄生电感和布局限制高频响应；不能替代低阻抗局部去耦回路。'],
    ['多电源设备需要检查上电时序和反向供电路径', '电源未建立时 IO 注入和内部保护结构可能导致反向供电，时序、隔离和使能控制需按器件要求设计。'],
    ['开关电源效率必定为 100%，纹波可忽略', '导通、开关和磁性器件等损耗使效率低于 100%，纹波与 EMI 仍需通过回路、滤波和测量控制。'],
  ], '电源设计要同时检查稳态容量和负载阶跃：Bulk 提供较慢的能量，局部去耦服务快速电流变化。误区是仅看电容标称容量而忽略 ESR/ESL 和回路。追问：补偿稳定性、轻载模式、浪涌和测量探头接地。', ['Buck', 'Boost', 'Bulk capacitor', '电源时序']),
  short(148, ['pcb-layout', 'pcb-routing', 'emc', 'schematic'], 'medium', '晶振及负载电容应怎样布局？为什么不宜从晶振附近穿过快速开关信号？',
    '晶振回路要短且按芯片推荐布局，负载电容回流清晰，远离高幅度高边沿噪声，减少耦合和寄生参数变化。',
    '晶振节点通常对寄生电容和噪声敏感；长走线或不合适的地布局可能改变有效负载、启动裕量和频率。应参照芯片与晶体厂商建议选择电容、限流电阻及屏蔽措施，不能统一规定所有设计必须采用某种铜皮。',
    '用探头测晶振会引入负载，应选合适的测量方式。追问：晶体负载电容不是两个电容简单相加、负阻裕量、温漂、ESR 和时钟失效后的恢复。', ['晶振布局', '负载电容', '寄生电容', 'EMI']),
  code(149, ['verilog', 'timing-analysis'], 'medium', '用 SystemVerilog 实现两状态握手 FSM：IDLE 收到 start 后进入 BUSY，done 后返回；同步高电平复位。',
    `module work_fsm(input logic clk, rst, start, done,
                output logic busy);
  typedef enum logic {IDLE, BUSY} state_t;
  state_t state, next_state;
  always_comb begin
    next_state = state;
    case (state)
      IDLE: if (start) next_state = BUSY;
      BUSY: if (done) next_state = IDLE;
      default: next_state = IDLE;
    endcase
  end
  always_ff @(posedge clk) begin
    if (rst) state <= IDLE;
    else state <= next_state;
  end
  assign busy = (state == BUSY);
endmodule`,
    '组合逻辑默认赋值防止锁存器，时序状态寄存器使用非阻塞赋值。rst 仅在时钟上升沿采样，因此是同步复位；start/done 假设已在本时钟域同步。本题仅有一个状态位，输出可能有组合路径，是否寄存取决于接口要求。常见错误是漏默认分支、把异步输入直接送状态机或混淆复位敏感列表。', ['FSM', 'always_comb', 'always_ff', '同步复位']),
  short(150, ['verilog', 'timing-analysis', 'quartus', 'domestic-fpga'], 'hard', '异步 FIFO 为什么常用 Gray 指针跨时钟域？仅用 Gray 编码就足够吗？',
    'Gray 指针连续增量只改变一个位，配合同步器可降低跨域采到混合二进制位的风险；还需要正确满空逻辑、复位和布线时序约束。',
    '读写指针在各自时钟域更新，将 Gray 形式同步到对方后计算保守的满空状态。同步延迟可能使可用容量判断滞后，这是安全性与吞吐的权衡。Gray 码本身不能消除亚稳态，多位路径过大偏斜可能破坏预期，需采用工具认可的 CDC 结构和约束。',
    '迁移 Quartus 或国产 FPGA 时应检查双口 RAM 推导、CDC 属性和约束语法，不要只仿真功能。追问：额外回绕位、复位释放协调、指针转换以及 FIFO 深度为二次幂的常见实现前提。', ['异步FIFO', 'Gray编码', 'CDC', '满空判断', '时序约束']),
]
