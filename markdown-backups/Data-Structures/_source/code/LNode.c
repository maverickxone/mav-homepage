#include <stdio.h>
#include <stdlib.h>  // malloc, free

typedef int ElemType;

// --- 1. 定义节点结构体 ---
typedef struct LNode {
    ElemType      data;
    struct LNode *next;
} LNode, *LinkList;

// --- 2. 头插法建表（新节点插到头部，结果是逆序的） ---
LinkList List_HeadInsert(LinkList L, int n) {
    L = (LinkList)malloc(sizeof(LNode));  // 创建头节点（dummy）
    L->next = NULL;

    for (int i = 0; i < n; i++) {
        LNode *s = (LNode *)malloc(sizeof(LNode));
        scanf("%d", &s->data);
        s->next = L->next;  // 新节点指向原来的第一个节点
        L->next = s;        // 头节点指向新节点
    }
    return L;
}

// --- 3. 尾插法建表（新节点插到尾部，结果是正序的） ---
LinkList List_TailInsert(LinkList L, int n) {
    L = (LinkList)malloc(sizeof(LNode));  // 创建头节点（dummy）
    L->next = NULL;
    LNode *r = L;  // r 是尾指针，初始指向头节点

    for (int i = 0; i < n; i++) {
        LNode *s = (LNode *)malloc(sizeof(LNode));
        scanf("%d", &s->data);
        r->next = s;  // 新节点接到尾部
        r = s;        // 尾指针后移
    }
    r->next = NULL;   // 最后收尾，置空
    return L;
}

// --- 4. 打印链表（跳过头节点，从第一个数据节点开始） ---
void PrintList(LinkList L) {
    LNode *p = L->next;  // 跳过 dummy
    while (p != NULL) {
        printf("%d ", p->data);
        p = p->next;
    }
    printf("\n");
}

// --- 5. 释放整个链表 ---
void DestroyList(LinkList L) {
    LNode *p = L, *tmp;
    while (p != NULL) {
        tmp = p->next;  // 先记住下一个
        free(p);         // 再释放当前
        p = tmp;
    }
}

int main(void) {
    LinkList L = NULL;
    int n;

    printf("输入节点个数: ");
    scanf("%d", &n);

    // 尾插法建表（正序）
    printf("输入 %d 个数据（尾插法）: ", n);
    L = List_TailInsert(L, n);
    printf("链表内容: ");
    PrintList(L);

    // 用完后释放
    DestroyList(L);

    return 0;
}
