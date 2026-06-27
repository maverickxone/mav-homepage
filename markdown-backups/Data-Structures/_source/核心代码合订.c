/*
 * 数据结构核心代码合订（C 风格，可直接编译运行）
 * 编译: gcc 核心代码合订.c -o ds && ./ds
 *
 * 内容索引:
 *   1. 顺序表 SqList        —— 插入/删除
 *   2. 单链表 LinkList      —— 头插/尾插/插入/删除/反转/打印
 *   3. 顺序栈 SqStack       —— 入栈/出栈/括号匹配
 *   4. 循环队列 SqQueue     —— 入队/出队/判空判满
 *   5. 二叉树 BiTree        —— 建树/前中后层序遍历/高度/节点数
 *   6. 二叉搜索树 BST       —— 插入/查找/删除/中序输出
 *   7. KMP                  —— 求 next + 匹配
 *   8. 七大排序             —— 插入/希尔/冒泡/快排/选择/堆/归并
 *
 * 每一部分配一个 test_xxx() 函数，main 里依次调用、打印结果。
 * 学习建议: 先盖住实现，自己照讲义敲一遍，再和这里对照。
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef int ElemType;

/* 工具: 打印整型数组 */
void printArr(int a[], int n) {
    for (int i = 0; i < n; i++) printf("%d ", a[i]);
    printf("\n");
}

/* ============================================================
 * 1. 顺序表 SqList
 * ============================================================ */
#define MAXSIZE 100
typedef struct {
    ElemType data[MAXSIZE];
    int length;
} SqList;

void SqList_init(SqList *L) { L->length = 0; }

/* 在第 i 个位置(1..length+1)插入 e */
int SqList_insert(SqList *L, int i, ElemType e) {
    if (i < 1 || i > L->length + 1) return 0;
    if (L->length >= MAXSIZE) return 0;
    for (int j = L->length - 1; j >= i - 1; j--)  /* 从后往前挪 */
        L->data[j + 1] = L->data[j];
    L->data[i - 1] = e;
    L->length++;
    return 1;
}

/* 删除第 i 个元素, 值带回 *e */
int SqList_delete(SqList *L, int i, ElemType *e) {
    if (i < 1 || i > L->length) return 0;
    *e = L->data[i - 1];
    for (int j = i; j < L->length; j++)            /* 从前往后挪 */
        L->data[j - 1] = L->data[j];
    L->length--;
    return 1;
}

void test_SqList(void) {
    printf("=== 1. 顺序表 ===\n");
    SqList L; SqList_init(&L);
    for (int i = 1; i <= 5; i++) SqList_insert(&L, i, i * 10); /* 10 20 30 40 50 */
    printf("初始: "); printArr(L.data, L.length);
    SqList_insert(&L, 3, 99);  printf("在第3位插99: "); printArr(L.data, L.length);
    ElemType e;
    SqList_delete(&L, 1, &e);  printf("删第1个(%d后): ", e); printArr(L.data, L.length);
    printf("\n");
}

/* ============================================================
 * 2. 单链表 LinkList (带头结点)
 * ============================================================ */
typedef struct LNode {
    ElemType data;
    struct LNode *next;
} LNode, *LinkList;

LinkList List_initHead(void) {                 /* 创建带头结点的空表 */
    LinkList L = (LinkList)malloc(sizeof(LNode));
    L->next = NULL;
    return L;
}

void List_insertTail(LinkList L, ElemType e) { /* 尾插一个元素 */
    LNode *p = L;
    while (p->next) p = p->next;                /* 走到尾 */
    LNode *s = (LNode *)malloc(sizeof(LNode));
    s->data = e; s->next = NULL;
    p->next = s;
}

/* 在第 i 个位置插入 e (先接后断) */
int List_insert(LinkList L, int i, ElemType e) {
    LNode *p = L; int j = 0;
    while (p && j < i - 1) { p = p->next; j++; } /* 找第 i-1 个(前驱) */
    if (!p) return 0;
    LNode *s = (LNode *)malloc(sizeof(LNode));
    s->data = e;
    s->next = p->next;                           /* 先接 */
    p->next = s;                                 /* 后断 */
    return 1;
}

/* 删除第 i 个节点, 值带回 *e */
int List_delete(LinkList L, int i, ElemType *e) {
    LNode *p = L; int j = 0;
    while (p && j < i - 1) { p = p->next; j++; }  /* 找前驱 */
    if (!p || !p->next) return 0;
    LNode *q = p->next;                           /* q 是要删的 */
    *e = q->data;
    p->next = q->next;                            /* 跳过 q */
    free(q);                                      /* 释放 */
    return 1;
}

/* 反转链表(三指针滚动), 头结点不变 */
void List_reverse(LinkList L) {
    LNode *prev = NULL, *cur = L->next;
    while (cur) {
        LNode *next = cur->next;                  /* 先记住下一个 */
        cur->next = prev;                         /* 掉头 */
        prev = cur; cur = next;                   /* 整体后移 */
    }
    L->next = prev;                               /* 新头 */
}

void List_print(LinkList L) {
    for (LNode *p = L->next; p; p = p->next) printf("%d ", p->data);
    printf("\n");
}

void test_LinkList(void) {
    printf("=== 2. 单链表 ===\n");
    LinkList L = List_initHead();
    for (int i = 1; i <= 5; i++) List_insertTail(L, i); /* 1 2 3 4 5 */
    printf("尾插建表: "); List_print(L);
    List_insert(L, 2, 99); printf("第2位插99: "); List_print(L);
    ElemType e; List_delete(L, 2, &e); printf("删第2个(%d后): ", e); List_print(L);
    List_reverse(L); printf("反转后: "); List_print(L);
    printf("\n");
}

/* ============================================================
 * 3. 顺序栈 SqStack + 括号匹配应用
 * ============================================================ */
typedef struct {
    ElemType data[MAXSIZE];
    int top;                 /* top 指向栈顶元素, 空栈 -1 */
} SqStack;

void Stack_init(SqStack *S) { S->top = -1; }
int  Stack_empty(SqStack *S) { return S->top == -1; }
int  Stack_push(SqStack *S, ElemType e) {
    if (S->top == MAXSIZE - 1) return 0;
    S->data[++S->top] = e; return 1;
}
int  Stack_pop(SqStack *S, ElemType *e) {
    if (S->top == -1) return 0;
    *e = S->data[S->top--]; return 1;
}

/* 括号匹配: 字符串里 ()[]{} 是否配对 */
int bracketMatch(const char *s) {
    SqStack S; Stack_init(&S);
    for (int i = 0; s[i]; i++) {
        char c = s[i];
        if (c == '(' || c == '[' || c == '{') Stack_push(&S, c);
        else if (c == ')' || c == ']' || c == '}') {
            ElemType t;
            if (!Stack_pop(&S, &t)) return 0;                 /* 没有左括号可配 */
            if ((c == ')' && t != '(') ||
                (c == ']' && t != '[') ||
                (c == '}' && t != '{')) return 0;             /* 类型不匹配 */
        }
    }
    return Stack_empty(&S);                                   /* 最后栈空才全配对 */
}

void test_Stack(void) {
    printf("=== 3. 顺序栈 + 括号匹配 ===\n");
    const char *t1 = "([]{})", *t2 = "([)]";
    printf("\"%s\" 匹配? %s\n", t1, bracketMatch(t1) ? "是" : "否");
    printf("\"%s\" 匹配? %s\n", t2, bracketMatch(t2) ? "是" : "否");
    printf("\n");
}

/* ============================================================
 * 4. 循环队列 SqQueue (牺牲一个单元区分空满)
 * ============================================================ */
#define QSIZE 6
typedef struct {
    ElemType data[QSIZE];
    int front, rear;         /* rear 指向队尾元素的下一个位置 */
} SqQueue;

void Queue_init(SqQueue *Q) { Q->front = Q->rear = 0; }
int  Queue_empty(SqQueue *Q) { return Q->front == Q->rear; }
int  Queue_full(SqQueue *Q)  { return (Q->rear + 1) % QSIZE == Q->front; }
int  Queue_count(SqQueue *Q) { return (Q->rear - Q->front + QSIZE) % QSIZE; }

int Queue_en(SqQueue *Q, ElemType e) {
    if (Queue_full(Q)) return 0;
    Q->data[Q->rear] = e;
    Q->rear = (Q->rear + 1) % QSIZE;
    return 1;
}
int Queue_de(SqQueue *Q, ElemType *e) {
    if (Queue_empty(Q)) return 0;
    *e = Q->data[Q->front];
    Q->front = (Q->front + 1) % QSIZE;
    return 1;
}

void test_Queue(void) {
    printf("=== 4. 循环队列 ===\n");
    SqQueue Q; Queue_init(&Q);
    for (int i = 1; i <= 5; i++) Queue_en(&Q, i);   /* QSIZE=6, 最多存5个 */
    printf("入队 1..5, 当前个数=%d, 队满? %s\n", Queue_count(&Q), Queue_full(&Q) ? "是" : "否");
    ElemType e; Queue_de(&Q, &e); Queue_de(&Q, &e);
    printf("出队两个后个数=%d\n", Queue_count(&Q));
    Queue_en(&Q, 6); Queue_en(&Q, 7);               /* 测试绕回 */
    printf("再入队 6,7(绕回), 个数=%d: ", Queue_count(&Q));
    while (!Queue_empty(&Q)) { Queue_de(&Q, &e); printf("%d ", e); }
    printf("\n\n");
}

/* ============================================================
 * 5. 二叉树 BiTree (二叉链表) + 四种遍历
 * ============================================================ */
typedef struct BiTNode {
    ElemType data;
    struct BiTNode *lchild, *rchild;
} BiTNode, *BiTree;

BiTNode *newNode(ElemType x) {
    BiTNode *p = (BiTNode *)malloc(sizeof(BiTNode));
    p->data = x; p->lchild = p->rchild = NULL;
    return p;
}

void preOrder(BiTree T)  { if (T) { printf("%d ", T->data); preOrder(T->lchild);  preOrder(T->rchild);  } }
void inOrder(BiTree T)   { if (T) { inOrder(T->lchild);  printf("%d ", T->data);  inOrder(T->rchild);   } }
void postOrder(BiTree T) { if (T) { postOrder(T->lchild); postOrder(T->rchild); printf("%d ", T->data); } }

int treeHeight(BiTree T) {
    if (!T) return 0;
    int lh = treeHeight(T->lchild), rh = treeHeight(T->rchild);
    return (lh > rh ? lh : rh) + 1;
}
int countNodes(BiTree T) {
    if (!T) return 0;
    return countNodes(T->lchild) + countNodes(T->rchild) + 1;
}

/* 层序遍历: 用一个简单的指针队列 */
void levelOrder(BiTree T) {
    if (!T) return;
    BiTNode *q[MAXSIZE]; int front = 0, rear = 0;
    q[rear++] = T;
    while (front < rear) {
        BiTNode *p = q[front++];
        printf("%d ", p->data);
        if (p->lchild) q[rear++] = p->lchild;
        if (p->rchild) q[rear++] = p->rchild;
    }
}

void test_BiTree(void) {
    printf("=== 5. 二叉树遍历 ===\n");
    /*        1
     *       / \
     *      2   3
     *     / \   \
     *    4   5   6   */
    BiTree T = newNode(1);
    T->lchild = newNode(2); T->rchild = newNode(3);
    T->lchild->lchild = newNode(4); T->lchild->rchild = newNode(5);
    T->rchild->rchild = newNode(6);
    printf("前序: "); preOrder(T);   printf("\n");
    printf("中序: "); inOrder(T);    printf("\n");
    printf("后序: "); postOrder(T);  printf("\n");
    printf("层序: "); levelOrder(T); printf("\n");
    printf("高度=%d, 节点数=%d\n\n", treeHeight(T), countNodes(T));
}

/* ============================================================
 * 6. 二叉搜索树 BST
 * ============================================================ */
void BST_insert(BiTree *T, ElemType key) {
    if (*T == NULL) { *T = newNode(key); return; }
    if (key < (*T)->data)      BST_insert(&(*T)->lchild, key);
    else if (key > (*T)->data) BST_insert(&(*T)->rchild, key);
    /* 相等则不插 */
}

BiTNode *BST_search(BiTree T, ElemType key) {
    while (T && T->data != key)
        T = (key < T->data) ? T->lchild : T->rchild;
    return T;
}

/* 删除 key (递归版, 用中序后继替换) */
BiTree BST_delete(BiTree T, ElemType key) {
    if (!T) return NULL;
    if (key < T->data)      T->lchild = BST_delete(T->lchild, key);
    else if (key > T->data) T->rchild = BST_delete(T->rchild, key);
    else {                                       /* 找到了 */
        if (!T->lchild) { BiTNode *r = T->rchild; free(T); return r; }   /* 情况1/2 */
        if (!T->rchild) { BiTNode *l = T->lchild; free(T); return l; }
        BiTNode *succ = T->rchild;               /* 情况3: 找右子树最小(中序后继) */
        while (succ->lchild) succ = succ->lchild;
        T->data = succ->data;                    /* 值替换 */
        T->rchild = BST_delete(T->rchild, succ->data); /* 删掉那个后继 */
    }
    return T;
}

void test_BST(void) {
    printf("=== 6. 二叉搜索树 BST ===\n");
    BiTree T = NULL;
    int arr[] = {45, 24, 53, 12, 28, 90};
    for (int i = 0; i < 6; i++) BST_insert(&T, arr[i]);
    printf("插入后中序(应升序): "); inOrder(T); printf("\n");
    printf("查找 28: %s\n", BST_search(T, 28) ? "找到" : "没找到");
    printf("查找 99: %s\n", BST_search(T, 99) ? "找到" : "没找到");
    T = BST_delete(T, 45);   /* 删根(两个孩子) */
    printf("删 45 后中序: "); inOrder(T); printf("\n\n");
}

/* ============================================================
 * 7. KMP 字符串匹配
 * ============================================================ */
void getNext(const char *P, int *next) {
    int m = (int)strlen(P);
    next[0] = -1;
    int i = 0, j = -1;
    while (i < m - 1) {
        if (j == -1 || P[i] == P[j]) { i++; j++; next[i] = j; }
        else j = next[j];
    }
}

int KMP(const char *S, const char *P) {
    int n = (int)strlen(S), m = (int)strlen(P);
    int *next = (int *)malloc(sizeof(int) * m);
    getNext(P, next);
    int i = 0, j = 0;
    while (i < n && j < m) {
        if (j == -1 || S[i] == P[j]) { i++; j++; }  /* i 永不回退 */
        else j = next[j];
    }
    free(next);
    return (j == m) ? i - m : -1;
}

void test_KMP(void) {
    printf("=== 7. KMP 匹配 ===\n");
    const char *S = "ababcabcacbab", *P = "abcac";
    int next[16]; getNext(P, next);
    printf("模式串 \"%s\" 的 next: ", P);
    for (int i = 0; i < (int)strlen(P); i++) printf("%d ", next[i]);
    printf("\n在 \"%s\" 中匹配 \"%s\", 位置(下标) = %d\n\n", S, P, KMP(S, P));
}

/* ============================================================
 * 8. 七大排序
 * ============================================================ */
void insertSort(int a[], int n) {              /* 直接插入 */
    for (int i = 1; i < n; i++) {
        int t = a[i], j = i - 1;
        while (j >= 0 && a[j] > t) { a[j + 1] = a[j]; j--; }
        a[j + 1] = t;
    }
}

void shellSort(int a[], int n) {               /* 希尔 */
    for (int gap = n / 2; gap > 0; gap /= 2)
        for (int i = gap; i < n; i++) {
            int t = a[i], j = i - gap;
            while (j >= 0 && a[j] > t) { a[j + gap] = a[j]; j -= gap; }
            a[j + gap] = t;
        }
}

void bubbleSort(int a[], int n) {              /* 冒泡 */
    for (int i = 0; i < n - 1; i++) {
        int swapped = 0;
        for (int j = 0; j < n - 1 - i; j++)
            if (a[j] > a[j + 1]) { int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; swapped = 1; }
        if (!swapped) break;
    }
}

int partition_(int a[], int low, int high) {   /* 快排一趟划分 */
    int pivot = a[low];
    while (low < high) {
        while (low < high && a[high] >= pivot) high--;
        a[low] = a[high];
        while (low < high && a[low] <= pivot) low++;
        a[high] = a[low];
    }
    a[low] = pivot;
    return low;
}
void quickSort(int a[], int low, int high) {
    if (low < high) {
        int p = partition_(a, low, high);
        quickSort(a, low, p - 1);
        quickSort(a, p + 1, high);
    }
}

void selectSort(int a[], int n) {              /* 简单选择 */
    for (int i = 0; i < n - 1; i++) {
        int mn = i;
        for (int j = i + 1; j < n; j++) if (a[j] < a[mn]) mn = j;
        if (mn != i) { int t = a[i]; a[i] = a[mn]; a[mn] = t; }
    }
}

void siftDown(int a[], int i, int n) {         /* 堆排: 下沉 */
    int t = a[i];
    for (int c = 2 * i + 1; c < n; c = 2 * c + 1) {
        if (c + 1 < n && a[c + 1] > a[c]) c++;
        if (a[c] <= t) break;
        a[i] = a[c]; i = c;
    }
    a[i] = t;
}
void heapSort(int a[], int n) {
    for (int i = n / 2 - 1; i >= 0; i--) siftDown(a, i, n);   /* 建大顶堆 */
    for (int i = n - 1; i > 0; i--) {
        int t = a[0]; a[0] = a[i]; a[i] = t;                 /* 堆顶换末尾 */
        siftDown(a, 0, i);                                   /* 恢复堆 */
    }
}

void merge_(int a[], int low, int mid, int high) {  /* 归并: 合并 */
    int *tmp = (int *)malloc(sizeof(int) * (high - low + 1));
    int i = low, j = mid + 1, k = 0;
    while (i <= mid && j <= high) tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];
    while (i <= mid)  tmp[k++] = a[i++];
    while (j <= high) tmp[k++] = a[j++];
    for (k = 0, i = low; i <= high; i++) a[i] = tmp[k++];
    free(tmp);
}
void mergeSort(int a[], int low, int high) {
    if (low < high) {
        int mid = (low + high) / 2;
        mergeSort(a, low, mid);
        mergeSort(a, mid + 1, high);
        merge_(a, low, mid, high);
    }
}

void test_sorts(void) {
    printf("=== 8. 七大排序 (原始: 49 38 65 97 76 13 27) ===\n");
    int base[] = {49, 38, 65, 97, 76, 13, 27};
    int n = 7, a[7];
    #define RUN(name, call) do { memcpy(a, base, sizeof(base)); call; printf("%-8s: ", name); printArr(a, n); } while (0)
    RUN("直接插入", insertSort(a, n));
    RUN("希尔",     shellSort(a, n));
    RUN("冒泡",     bubbleSort(a, n));
    RUN("快速",     quickSort(a, 0, n - 1));
    RUN("简单选择", selectSort(a, n));
    RUN("堆排序",   heapSort(a, n));
    RUN("归并",     mergeSort(a, 0, n - 1));
    #undef RUN
    printf("\n");
}

/* ============================================================ */
int main(void) {
    test_SqList();
    test_LinkList();
    test_Stack();
    test_Queue();
    test_BiTree();
    test_BST();
    test_KMP();
    test_sorts();
    printf("全部测试完成。\n");
    return 0;
}
