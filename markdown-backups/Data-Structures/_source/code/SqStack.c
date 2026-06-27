#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

#define MAXSIZE 100
typedef int ElemType;

/*============================================================
  栈的顺序存储结构定义
  top 指向【栈顶元素的下一个位置】（空栈时 top = 0）
============================================================*/
typedef struct {
    ElemType data[MAXSIZE];
    int top;
} SqStack;

/*============================================================
  题目 1：完成以下基础操作的函数体（每空只需 1~2 行）
============================================================*/

// 1-a. 初始化栈
void InitStack(SqStack *S) {
    // TODO: 把栈变成空栈
    S->top = -1;
}

// 1-b. 判空（空返回 true，否则 false）
bool StackEmpty(SqStack S) {
    // TODO
    return (S.top == -1);
}

// 1-c. 判满
bool StackFull(SqStack S) {
    // TODO
    return (S.top == MAXSIZE-1);
}

// 1-d. 入栈（成功返回 true）
bool Push(SqStack *S, ElemType x) {
    // TODO: 先判满，再入栈，最后 top++
    if (StackFull(*S)) {
        printf("已满！");
        return false;
    }

    S->data[++(S->top)] = x;

    return true;
}

// 1-e. 出栈（成功返回 true，用 *x 带出栈顶元素）
bool Pop(SqStack *S, ElemType *x) {
    // TODO: 先判空，再 top--，最后用 *x 带出元素
    if (StackEmpty(*S)) {
        printf("已空！");
        return false;
    }

    *x = S->data[S->top];
    S->top--;

    return true;
}

// 1-f. 读栈顶（不弹出，用 *x 带出，成功返回 true）
bool GetTop(SqStack S, ElemType *x) {
    // TODO
    if (StackEmpty(S)) {
        printf("已空！");
        return false;
    }

    *x = S.data[S.top];

    return true;
}

/*============================================================
  题目 2：利用栈，将一个整数数组逆序输出
  思路：全部 push 进栈，再全部 pop 出来 —— 就是逆序的
============================================================*/
void ReverseArray(int arr[], int n) {
    // TODO:
    // 1. 定义并初始化一个栈
    // 2. 把数组元素依次入栈
    // 3. 依次出栈并打印

    SqStack S;
    InitStack(&S);

    for (int i=0; i<n; i++){
        Push(&S, arr[i]);
    }

    printf("逆序结果: ");

    int value;
    for(int i=0; i<n; i++){
        Pop(&S, &value);
        printf("%d ", value);
    }

    // ...
    printf("\n");
}

/*============================================================
  题目 3：利用栈，检查一个字符串中的括号是否匹配
  只考虑 ( ) 这一种括号即可
  示例：
    "(1+2)*3"   → 匹配
    "((1+2)"    → 不匹配（少右括号）
    "1+2)"      → 不匹配（少左括号）
============================================================*/
bool BracketCheck(const char *str) {
    // TODO:
    // 1. 定义并初始化一个栈（存 char）
    // 2. 遍历字符串：
    //    - 遇到 '(' → push
    //    - 遇到 ')' → 先判空，空则不匹配；否则 pop
    // 3. 遍历结束后，栈必须为空才算匹配

    SqStack S;
    InitStack(&S);
    int value;

    while(*str != '\0') {
        if (*str == '(') {
            Push(&S, *str);
        }

        else if (*str == ')') {
            if (!Pop(&S, &value)) {
                return false;
            }
        }
        str++;
    }

    return StackEmpty(S);
}

/*============================================================
  题目 4（选做）：十进制转任意进制（2~16）
  利用栈保存每次取余的结果，最后弹出就是目标进制
  示例：25 转 2 进制 → 11001
============================================================*/
void DecimalConvert(int num, int base) {
    // TODO:
    // 1. 定义并初始化一个栈
    // 2. 循环：num % base 入栈，num = num / base，直到 num == 0
    // 3. 依次出栈并打印
    //    提示：如果 base > 10，余数 10~15 用 'A'~'F' 表示

    SqStack S;
    InitStack(&S);
    printf("十进制 %d 的 %d 进制表示: ", num, base);
    int value;

    while(num != 0) {
        Push(&S, num%base);

        num /= base;
    }

    while(!StackEmpty(S)) {
        Pop(&S, &value);
        printf("%d", value);
    }

    // ...
    printf("\n");
}

/*============================================================
  main：测试你的答案
============================================================*/
int main(void) {
    printf("===== 题目 1：基础操作测试 =====\n");

    SqStack S;
    InitStack(&S);

    // 测试 Push
    for (int i = 1; i <= 5; i++) {
        Push(&S, i * 10);  // 压入 10, 20, 30, 40, 50
    }

    // 测试 GetTop
    ElemType x;
    if (GetTop(S, &x)) {
        printf("栈顶元素: %d（期望 50）\n", x);
    }

    // 测试 Pop
    printf("依次出栈: ");
    while (!StackEmpty(S)) {
        Pop(&S, &x);
        printf("%d ", x);  // 期望输出: 50 40 30 20 10
    }
    printf("\n");
    printf("出栈后是否为空: %s（期望 是）\n\n", StackEmpty(S) ? "是" : "否");

    printf("===== 题目 2：数组逆序 =====\n");
    int arr[] = {1, 2, 3, 4, 5};
    printf("原始数组: 1 2 3 4 5\n");
    ReverseArray(arr, 5);  // 期望: 5 4 3 2 1
    printf("\n");

    printf("===== 题目 3：括号匹配 =====\n");
    const char *tests[] = {"(1+2)*3", "((1+2)", "1+2)", "((1+2)*(3+4))", NULL};
    for (int i = 0; tests[i] != NULL; i++) {
        printf("\"%s\" → %s\n", tests[i], BracketCheck(tests[i]) ? "匹配 ✓" : "不匹配 ✗");
    }
    printf("\n");

    printf("===== 题目 4：进制转换 =====\n");
    DecimalConvert(25, 2);    // 期望: 11001
    DecimalConvert(255, 16);   // 期望: FF
    DecimalConvert(255, 8);    // 期望: 377
    printf("\n");

    return 0;
}
