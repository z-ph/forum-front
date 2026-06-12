# Product

## Register

product

## Users
论坛社区用户，主要在桌面端浏览和参与讨论，需要快速登录/注册以进入核心讨论流程。用户群体涵盖新老社区成员，包括技术爱好者和DIY爱好者。

## Product Purpose
机器人DIY论坛前端，提供主题浏览、发帖、回复、分类筛选等社区核心功能。登录页是进入社区的入口，目标是让用户尽快完成身份验证、进入论坛。

## Brand Personality
真实、清晰、克制。稳定、可信、务实。不追求视觉炫技，追求高效完成任务。

## Anti-references
- 过度装饰的登录页（大背景图、3D动画、粒子效果）
- SaaS 风格的 metric-hero 登录页
- 极简到信息不足的登录页
- 模糊毛玻璃卡片堆叠

## Design Principles
1. 优先保证核心流程清晰可用：登录、注册一步到位。
2. 组件复用 Element Plus，自定义集中在布局和信息层级。
3. 信息密度接近真实社区，不是极简留白展示页。
4. 浅色模式为默认，关键视觉语义跟随主题色。
5. 结构为真实数据接口预留形态，mock 阶段保持可迁移性。

## Accessibility & Inclusion
- WCAG 2.1 AA 级对比度
- 支持键盘导航和 focus-visible
- 尊重 prefers-reduced-motion
- 表单标签和错误信息清晰可读
