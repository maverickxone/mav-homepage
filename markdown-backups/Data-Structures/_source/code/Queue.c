#define MAXSIZE 100
typedef int ElemType;

typedef struct {
    ElemType data[MAXSIZE];
    int front;    // 指向队头元素
    int rear;     // 指向队尾元素的"下一个"位置(约定)
} SqQueue;

void InitQueue(SqQueue *Q) {
    Q->front = Q->rear = 0;        // 初始都指向 0
}

// 判空:队头追上队尾
int QueueEmpty(SqQueue *Q) {
    return Q->front == Q->rear;
}

// 判满:rear 的下一个位置就是 front(中间空一格)
int QueueFull(SqQueue *Q) {
    return (Q->rear + 1) % MAXSIZE == Q->front;
}

// 入队
int EnQueue(SqQueue *Q, ElemType e) {
    if ((Q->rear + 1) % MAXSIZE == Q->front)   // 满
        return 0;
    Q->data[Q->rear] = e;                       // 元素放到队尾位置
    Q->rear = (Q->rear + 1) % MAXSIZE;          // rear 后移(可能绕回)
    return 1;
}

// 出队
int DeQueue(SqQueue *Q, ElemType *e) {
    if (Q->front == Q->rear)                    // 空
        return 0;
    *e = Q->data[Q->front];                     // 取队头元素
    Q->front = (Q->front + 1) % MAXSIZE;        // front 后移(可能绕回)
    return 1;
}
