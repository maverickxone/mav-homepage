#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

#define MAXSIZE 100
typedef int ElemType;

/*============================================================
  队列的顺序存储结构定义（循环队列）
  front 指向【队头元素】
  rear  指向【队尾元素的下一个位置】
  空队条件：front == rear
  满队条件：(rear + 1) % MAXSIZE == front
  （牺牲一个存储位来区分空 / 满）
============================================================*/
typedef struct {
    ElemType data[MAXSIZE];
    int front;
    int rear;
} SqQueue;

/*============================================================
  题目 1：完成以下基础操作的函数体（每空只需 1~2 行）
============================================================*/

// 1-a. 初始化队列
void InitQueue(SqQueue *Q) {
    // TODO: 让队列变成空队列
    Q->front = Q->rear = 0;
}

// 1-b. 判空（空返回 true，否则 false）
bool QueueEmpty(SqQueue Q) {
    // TODO
    return (Q.front == Q.rear);
}

// 1-c. 判满
bool QueueFull(SqQueue Q) {
    // TODO: 注意循环队列满的条件
    return ((Q.rear+1) % MAXSIZE == Q.front);
}

// 1-d. 入队（成功返回 true）
bool EnQueue(SqQueue *Q, ElemType x) {
    // TODO:
    // 1. 先判满
    // 2. 把 x 放到 rear 位置
    // 3. rear 循环后移：(rear + 1) % MAXSIZE
    if (QueueFull(*Q)) {
        printf("已满");
        return false;
    }

    Q->data[Q->rear] = x;
    Q->rear = (Q->rear + 1) % MAXSIZE;

    return true;
}

// 1-e. 出队（成功返回 true，用 *x 带出队头元素）
bool DeQueue(SqQueue *Q, ElemType *x) {
    // TODO:
    // 1. 先判空
    // 2. 用 *x 取出 front 位置的元素
    // 3. front 循环后移：(front + 1) % MAXSIZE
    if (QueueEmpty(*Q)) {
        printf("已空");
        return false;
    }

    *x = Q->data[Q->front];
    Q->front = (Q->front + 1) % MAXSIZE;

    return true;
}

// 1-f. 读队头（不出队，用 *x 带出，成功返回 true）
bool GetHead(SqQueue Q, ElemType *x) {
    // TODO
    if (QueueEmpty(Q)) {
        printf("已空");
        return false;
    }

    *x = Q.data[Q.front];

    return true;
}

/*============================================================
  题目 2：击鼓传花（约瑟夫问题简化版）
  n 个人围成一圈，从第 1 个人开始报数，报到 k 的人出圈，
  输出所有人的出圈顺序。编号 1~n。
  思路：
    - 把 1~n 依次入队
    - 每轮循环：把前 k-1 个人依次出队再入队（绕过去）
    - 第 k 个人出队但不再入队（出圈），打印编号
    - 重复直到队列为空
============================================================*/
void HotPotato(int n, int k) {
    // TODO:
    // 1. 初始化队列，把 1~n 入队
    // 2. 循环（队列不空时）：
    //    a. 把前 k-1 个人出队再入队
    //    b. 第 k 个人出队，打印，不再入队
    printf("出圈顺序: ");

    SqQueue q;
    InitQueue(&q);

    for(int i=0; i<n; i++){
        EnQueue(&q, i);
    }

    while(!QueueEmpty(q)) {
        int count = 1;
        int x;
        while(count != k){
            DeQueue(&q, &x);
            EnQueue(&q, x);
            count++;
        }
        DeQueue(&q, &x);
        printf("%d ",x+1);
    }

    printf("\n");
}

/*============================================================
  题目 3：用队列 + 栈，判断一个字符串是否是回文
  示例：
    "abcba"  → 是回文
    "abcd"   → 不是回文
  思路：
    - 字符串全部既入队又入栈
    - 然后依次出队 / 出栈，比较每对字符是否相同
    - 利用栈的 LIFO 和队列的 FIFO 方向相反的特性
  提示：你需要自己定义一个字符型的栈（或复用 CharStack 思路）
============================================================*/

/* 简易字符栈（仅供本题使用） */
typedef struct {
    char data[MAXSIZE];
    int top;
} CharStack;

// 1-a. 初始化栈
void InitStack(CharStack *S) {
    // TODO: 把栈变成空栈
    S->top = -1;
}

// 1-b. 判空（空返回 true，否则 false）
bool StackEmpty(CharStack S) {
    // TODO
    return (S.top == -1);
}

// 1-c. 判满
bool StackFull(CharStack S) {
    // TODO
    return (S.top == MAXSIZE-1);
}

// 1-d. 入栈（成功返回 true）
bool Push(CharStack *S, ElemType x) {
    // TODO: 先判满，再入栈，最后 top++
    if (StackFull(*S)) {
        printf("已满！");
        return false;
    }

    S->data[++(S->top)] = x;

    return true;
}

// 1-e. 出栈（成功返回 true，用 *x 带出栈顶元素）
bool Pop(CharStack *S, ElemType *x) {
    // TODO: 先判空，再 top--，最后用 *x 带出元素
    if (StackEmpty(*S)) {
        printf("已空！");
        return false;
    }

    *x = S->data[S->top];
    S->top--;

    return true;
}

bool IsPalindrome(const char *str) {
    // TODO:
    // 1. 初始化一个 CharStack 和一个 SqQueue（用 char 当 ElemType 也行，自己决定）
    // 2. 遍历字符串，每个字符分别入栈、入队
    // 3. 再遍历：每次从栈弹出一个字符，从队列出一个字符，不同则返回 false
    // 4. 全部相同则返回 true

    CharStack s;
    InitStack(&s);
    SqQueue q;
    InitQueue(&q);

    int count = 0;
    while(str[count] != '\0') {
        if (StackFull(s)) {
            return false;
        }

        Push(&s, str[count]);
        count++;
    }

    count = 0;

    while(str[count] != '\0') {
        if (QueueFull(q)) {
            return false;
        }

        EnQueue(&q, str[count]);
        count++;
    }

    count = 0;

    while(str[count] != '\0') {
        int x_q, x_s;
        DeQueue(&q, &x_q);
        Pop(&s, &x_s);

        if(x_q != x_s) return false;

        count++;
    }

    return true;
}

/*============================================================
  main：测试你的答案
============================================================*/
int main(void) {
    printf("===== 题目 1：基础操作测试 =====\n");

    SqQueue Q;
    InitQueue(&Q);

    // 测试 EnQueue
    for (int i = 1; i <= 5; i++) {
        EnQueue(&Q, i * 10);  // 入队 10, 20, 30, 40, 50
    }

    // 测试 GetHead
    ElemType x;
    if (GetHead(Q, &x)) {
        printf("队头元素: %d（期望 10）\n", x);
    }

    // 测试 DeQueue
    printf("依次出队: ");
    while (!QueueEmpty(Q)) {
        DeQueue(&Q, &x);
        printf("%d ", x);  // 期望输出: 10 20 30 40 50
    }
    printf("\n");
    printf("出队后是否为空: %s（期望 是）\n\n", QueueEmpty(Q) ? "是" : "否");

    printf("===== 题目 2：击鼓传花 =====\n");
    printf("5 人，报到 3 出圈：\n");
    HotPotato(5, 3);  // 期望: 3 1 5 2 4
    printf("\n");

    printf("===== 题目 3：回文判断 =====\n");
    const char *tests[] = {"abcba", "abcd", "racecar", "hello", NULL};
    for (int i = 0; tests[i] != NULL; i++) {
        printf("\"%s\" → %s\n", tests[i], IsPalindrome(tests[i]) ? "是回文 ✓" : "不是回文 ✗");
    }
    printf("\n");

    return 0;
}
