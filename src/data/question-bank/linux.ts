import { choice, code, judgment, short } from './helpers'

export const linuxQuestions = [
  short(66, ['linux'], 'medium', 'fork 与 exec 的区别是什么？多线程程序 fork 后为什么特别需要谨慎？', 'fork 创建子进程，exec 替换当前进程的程序映像。多线程 fork 后子进程只保留调用线程。', 'fork 通常利用写时复制，父子具有独立地址空间和相关文件描述符。exec 成功不返回但 PID 通常不变。其他线程持有的用户态锁可能留在子进程中，多线程 fork 到 exec 之间应只调用允许的异步信号安全操作。', '误区：exec 创建另一个 PID，或子进程天然拥有所有原线程。追问 close-on-exec、waitpid 回收和 posix_spawn 的使用。', ['fork', 'exec', '写时复制']),
  short(67, ['linux'], 'medium', '管道、消息队列、共享内存和 socket 的 IPC 使用场景与代价如何比较？', '管道适合字节流，消息队列保留消息边界，共享内存减少复制但需同步，socket 支持本机或网络通信。', '共享内存本身不提供互斥与可见性协议，需信号量或合适的跨进程同步。管道和流式 socket 要处理部分读写与粘连；消息型接口也有容量限制。选择时考虑进程关系、数据量和故障隔离。', '误区：一次 write 对应一次 read 的应用消息。追问 framing、背压、断连和资源清理。', ['IPC', '管道', '共享内存']),
  judgment(68, ['linux'], 'medium', 'POSIX 信号处理函数中直接调用 printf 或 pthread_mutex_lock 总是安全的。', false, '这些函数通常不属于异步信号安全函数。信号可能打断库函数或持锁线程，再进入同样的内部锁会死锁或破坏状态。处理函数可以设置 volatile sig_atomic_t 标志，或用符合规范的 write 通知主循环。追问自管道、信号屏蔽和专用 sigwait 线程。', ['信号', '异步信号安全']),
  short(69, ['linux'], 'medium', 'Linux 虚拟内存给嵌入式进程带来什么？为什么 malloc 成功不等于物理内存已全部可用？', '虚拟地址空间提供映射和隔离，内存可能按需分配；过度提交和后续缺页可能使成功分配不等于立即有物理页。', '进程地址通过页表映射到物理内存，常见有匿名映射、文件映射与共享映射。缺页处理、回收和换页会引入延迟，硬实时路径可评估锁页与预触碰，但还需权限和系统配置。无 MMU 平台行为另当别论。', '误区：用户虚拟地址可直接写入 DMA 控制器，或 malloc 成功后系统绝不会 OOM。追问页大小、TLB、mlock 与 DMA 地址映射。', ['虚拟内存', '缺页', 'MMU']),
  choice(70, ['linux'], 'easy', 'Linux 文件描述符与 open file description 的关系，哪项描述正确？', 'single', 'B', [
    ['文件描述符就是磁盘物理扇区地址', '描述符是进程内的整数句柄，指向内核管理的打开对象，不暴露物理扇区位置。'],
    ['dup 后的描述符通常共享文件偏移和文件状态标志', 'dup 指向同一个打开文件描述，因此读写位置和部分状态共享，描述符自身标志则应区分。'],
    ['close 一个描述符自动关闭所有其他 dup 描述符', '每个描述符有独立引用，close 一个不会直接移除所有其他引用。'],
    ['任何进程中数字 3 都对应同一文件', '描述符号码按进程分配，相同整数不表示不同进程一定指向同一对象。'],
  ], '要区分描述符标志如 close-on-exec 与文件状态如 O_NONBLOCK。描述符也可表示 socket、管道、设备；追问 fork 继承、资源泄漏和标准输入输出。', ['文件描述符', 'dup']),
  short(71, ['linux'], 'hard', 'select、poll 与 epoll 如何实现 I/O 多路复用？边沿触发为何常配合非阻塞 I/O？', '它们等待多个描述符可读写；epoll 维护关注集合并返回就绪事件。边沿触发通常要求持续读写直到 EAGAIN。', 'select 的 fd_set 容量有限且集合需重建，poll 用数组，epoll 适合很多连接但并非任何负载都更快。LT 会持续报告仍就绪的条件，ET 关注状态变化，处理不彻底可能等不到新边沿。还应处理 EINTR、关闭与事件状态。', '误区：收到可读事件代表完整消息已到齐，或 ET 只读一次一定够。追问半关闭、应用缓冲及公平处理预算。', ['select', 'poll', 'epoll', 'ET']),
  short(72, ['linux', 'driver-development'], 'easy', '用户态与内核态有什么边界？为什么驱动不能直接解引用用户传入指针？', '内核态拥有受保护资源访问能力，用户态经系统调用请求服务；用户指针必须按内核接口检查和复制。', '用户地址可能无效、缺页或在并发下变化。驱动一般使用 copy_from_user/copy_to_user 等接口并检查返回值，不能把长度和嵌套指针当作可信值。用户态错误通常影响进程，内核错误可能影响整个系统。', '误区：ioctl 参数指针来自本机所以可靠。追问 TOCTOU、整数溢出及用户拷贝的睡眠上下文要求。', ['系统调用', '用户拷贝', '权限边界']),
  short(73, ['driver-development', 'linux'], 'medium', '字符设备驱动的主要接口和注册流程是什么？', '提供 file_operations 如 open/read/write/ioctl，用设备号及 cdev 关联驱动，可通过设备模型创建节点。', '典型流程是申请设备号、初始化并添加 cdev、创建设备；退出及失败路径按逆序释放。具体辅助 API 随内核版本变化，应依目标版本编写。read/write 要定义阻塞、偏移、返回长度和并发语义。', '误区：有 /dev 节点就代表驱动全部就绪，或 read 只能返回请求的全部字节。追问 poll、wait queue、引用计数与热拔出。', ['字符设备', 'file_operations', 'cdev']),
  short(74, ['driver-development'], 'medium', 'Device Tree 与 platform driver 如何配合描述和驱动片上外设？', '设备树描述硬件资源和属性，platform 驱动通过匹配绑定设备，probe 获取资源并初始化。', 'compatible 与匹配表建立关系；reg、interrupts、clocks、resets 等属性通过内核子系统解析。设备树不应塞业务算法。管理型资源 API 可以简化生命周期，但不会替应用保证所有异步工作自动停止。', '误区：compatible 名字相似就能用任意驱动。追问 binding 校验、延迟 probe、时钟依赖和 remove 时序。', ['Device Tree', 'platform driver', 'probe']),
  short(75, ['driver-development', 'linux'], 'hard', 'Linux 驱动中硬中断与线程化中断如何分工？什么时候不能睡眠？', '硬中断处理确认来源和必要的快速应答，耗时或可睡眠处理可交给合适的线程化中断或工作队列。', '硬 IRQ 和持有普通自旋锁的原子上下文不能调用会睡眠的接口。线程化 handler 在适当配置下可睡眠，但仍要防止长期占用和设备中断重复。使用 request_threaded_irq 时结合触发类型和 IRQF_ONESHOT 语义设计。', '误区：所有 bottom half 都可睡眠，或把任意慢处理直接搬进硬 IRQ。追问共享 IRQ 返回值、同步退出和 PREEMPT_RT 的区别。', ['硬中断', '线程化中断', '原子上下文']),
  short(76, ['driver-development', 'linux'], 'hard', 'mmap 与 ioctl 在设备接口中各适合什么？如何避免暴露危险内存？', 'ioctl 传控制命令和参数，mmap 映射数据或合法资源以减少复制；两者都需明确权限、边界和生命周期。', 'ioctl 应用稳定的命令编号和固定宽度 ABI，校验长度、方向和 compat 情况。mmap 只允许规定范围及正确缓存属性，不能映射任意物理地址给不可信进程。设备移除时还要处理映射仍被引用的情况。', '误区：mmap 等于完全没有同步成本。追问 DMA 一致性、缓冲区所有权及 32/64 位 ABI 兼容。', ['mmap', 'ioctl', '用户ABI']),
  code(77, ['shell', 'linux'], 'easy', '写一个 Shell 脚本，在日志文件中按字面搜索关键字，正确处理带空格的文件名并返回 grep 状态。', `#!/bin/sh
if [ "$#" -ne 2 ]; then
    printf 'usage: %s keyword file\\n' "$0" >&2
    exit 2
fi
grep -n -F -- "$1" "$2"
status=$?
exit "$status"
# GNU/Linux grep: 0 匹配，1 无匹配，2 错误。`, '双引号防止单词拆分和通配展开，-F 按字面而非正则，-- 防止关键字被当作选项。常见错误：忘记引号、把“无匹配”当成执行异常，或依赖管道最后一个状态代表整个管道。追问 tail -f、find、权限和 stdout/stderr 重定向。', ['Shell引用', 'grep', '退出状态']),
]
