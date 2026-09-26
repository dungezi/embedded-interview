# 题库内容与维护说明

参考答案用于面试复习，涉及具体芯片、SDK、编译器或内核版本时应核对目标平台。新增题目的原理、误区及工程追问分别写在参考答案与知识总结中，不把型号特性当成系列通用保证。

## 本次核对使用的官方资料

- [ESP-IDF FreeRTOS 多核说明](https://docs.espressif.com/projects/esp-idf/en/release-v5.2/esp32/api-reference/system/freertos_idf.html)：核对任务亲和性、单核与双核的区别。
- [FreeRTOS mutex](https://freertos.org/Real-time-embedded-RTOS-mutexes.html)：核对基本优先级继承和多锁限制。
- [Arm Cortex-M33 寄存器模型](https://developer.arm.com/documentation/100230/0004/functional-description/programmers-model/processor-core-registers-summary)：核对主栈与进程栈；其他内核需对应手册。
- [RISC-V ISA 规范](https://docs.riscv.org/reference/isa/v20240411/unpriv/intro.html)：核对 RV32/RV64、ISA 与软件 ABI 的区别。
- [Linux execve](https://man7.org/linux/man-pages/man2/execve.2.html)、[epoll](https://www.man7.org/linux/man-pages/man7/epoll.7.html)、[signal](https://www.man7.org/linux/man-pages/man7/signal.7.html)：核对进程映像、事件模式和信号行为。
- [Linux 设备模型](https://cdn.kernel.org/doc/html/latest/driver-api/driver-model/overview.html)：核对设备与驱动关系。
- [ST STM32H7 HAL/LL 手册](https://www.st.com/resource/en/user_manual/um2217-description-of-stm32h7-hal-and-lowlayer-drivers-stmicroelectronics.pdf)：核对 HAL/LL 层次；频率和寄存器参数以各型号参考手册为准。
- [Intel Quartus 设计建议](https://www.intel.com/programmable/technical-pdfs/683323.pdf)：核对同步链、亚稳态分析和约束。

## 数据兼容性

v0.3.0 新增内容核对资料：

- [ESP-IDF OTA](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/system/ota.html)：升级确认与回滚。
- [FreeRTOS 任务通知](https://www.freertos.org/Documentation/02-Kernel/04-API-references/05-Direct-to-task-notifications/04-xTaskNotify)、[内存管理](https://docs.aws.amazon.com/freertos/latest/userguide/application-memory-management.html)：通知语义和 heap_1–heap_5。
- [Linux sysfs](https://cdn.kernel.org/doc/html/latest/filesystems/sysfs.html)：设备模型属性与 ABI。
- [Bosch CAN FD](https://www.bosch-semiconductors.com/products/ip-modules/can-protocols/can-fd/)：数据长度和阶段速率。
- [Bluetooth LE primer](https://www.bluetooth.com/bluetooth-le-primer/)：UUID、ATT Notification 与 Indication。
- [Intel 双时钟 FIFO 约束](https://www.intel.com/content/www/us/en/docs/programmable/683082/22-1/dual-clock-fifo-timing-constraints.html)：Gray 指针同步与偏斜限制。

保留原有题目 ID 1–150，本轮选择题扩充追加 ID 151–200；不改变 Question/Option 或学习记录结构。

localStorage 仍使用 `embedded-interview:study:v1`，没有迁移或自动清空。浏览页仅接收收藏接口，读取和展开答案不执行作答记录写入。旧记录中缺省 outcome 的记录仍可读取。

## 验证

执行 `npm run check:data` 获得实时分类、题型、难度统计，代码校验使用项目已有 TypeScript 和 React，无新增依赖。浏览页 12 题分页、筛选变化重置页码；查询在标题、related 和 Question.explanation 中去除首尾空白后忽略大小写匹配，不搜索用户答案。

校验还检查完全重复标题及标题三元组相似度达到 0.8 的候选。此检查不能代替语义审阅；新增题目的知识点与已有题目有交叉，但分别考查实现边界、错误定位、应用取舍或架构区别。


## 主观题评分

全部 89 道主观题配置数据位于 `src/data/question-bank/evaluation.ts`。每个关键点的一组关键词为同义候选，任一命中计入该点权重；权重按总和归一化到百分制，再扣除错误概念罚分，限制在 0–100。匹配忽略大小写、常见空白和全半角差异，不理解完整语义或执行代码。简单否定保护避免将“不能保证线程安全”直接误判为对应错误断言。

提交立刻保存评分及答案，selfAssessment 缺省采用 null；用户可选掌握、部分掌握、不会或跳过，也可直接继续。一次提交与后续自评共用 attemptId，更新同一条记录；重练使用新 ID 保留历史，并按最新结果更新错题和待复习。匹配度小于 60 或自评不会进入错题，部分掌握进入待复习，两者可重叠。缺少规则时 score 为 null，跳过则进入待复习，不伪造评分。

StudyData 的 reviewIds 从旧数据缺省为空数组；新增记录字段均可选。Profile 客观正确率统计全部客观作答，主观完成、自评与平均匹配度按每题最新一次记录统计；没有评分的旧记录不计入平均值。

筛选规则已调整：未选方向显示 0 道；题库浏览显式默认选中全部方向。本轮追加 50 道选择题（单选 27、多选 23），总量为 200 道。新题分别放在 choice-programming-processors.ts、choice-systems-protocols.ts、choice-hardware-tools.ts，覆盖代码行为、时序计算、工程诊断和架构取舍。运行 `npm run check:subjective` 可验证评分边界、四种自评、记录更新、旧数据及客观正确率隔离。

## 选择题扩充核对资料

- [ST STM32F446 参考手册](https://www.st.com/resource/en/reference_manual/dm00135183.pdf)：GPIO BSRR、定时器配置及 USART DMA/TC 区别；其他芯片需核对自身手册。
- [ESP-IDF GPIO](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/peripherals/gpio.html)：输入专用、内部上下拉和启动采样引脚限制。
- [FreeRTOS 延时](https://freertos.org/a00127.html)及前述内核参考手册：相对/周期延时、stream/message buffer 的单读单写约束。
- [Linux dup](https://man7.org/linux/man-pages/man2/dup.2.html)、[open](https://man7.org/linux/man-pages/man2/open.2.html)、[条件变量](https://www.man7.org/linux/man-pages/man3/pthread_cond_wait.3.html)：共享文件偏移与谓词同步。
- [Intel 时钟分析](https://www.intel.com/content/www/us/en/support/programmable/support-resources/design-examples/quartus/tq-clock.html)：setup/hold 与时钟关系。
- [Arm Cortex-M7 异常模型](https://support.arm.com/documentation/ddi0489/b/programmers-model/exceptions?lang=en)：尾链优化与上下文保存。
- [TI 运放设计资料](https://www.ti.com/lit/an/snoa475f/snoa475f.pdf)：压摆率与大信号动态限制。

