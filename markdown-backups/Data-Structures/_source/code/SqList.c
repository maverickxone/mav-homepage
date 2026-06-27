#include <stdio.h>
#define MAXSIZE 100          // 顺序表最大容量(预先定好)

typedef int ElemType;        // 元素类型,本课约定先用 int

typedef struct {
    ElemType data[MAXSIZE];  // 存元素的数组,这就是那块"连续内存"
    int length;              // 当前实际有多少个元素(注意:不是数组容量,是实际长度)
} SqList;                    // SqList = Sequence List 顺序表

// 在顺序表 L 的第 i 个位置插入元素 e。成功返回 1,失败返回 0。
int ListInsert(SqList *L, int i, ElemType e) {
    if (i < 1 || i > L->length + 1)      // 插入位置必须在 [1, length+1] 之间
        return 0;                         // (可以插在末尾的下一个位置,所以是 length+1)
    if (L->length >= MAXSIZE)            // 表满了,插不下
        return 0;

    // 2. 从最后一个元素开始,逐个往后挪,直到第 i 个位置
    //    位序 i 对应下标 i-1;最后一个元素下标是 length-1
    for (int j = L->length - 1; j >= i - 1; j--) {
        L->data[j + 1] = L->data[j];     // 把第 j 格的内容搬到第 j+1 格
    }

    // 3. 此时下标 i-1 的位置空出来了,放入新元素
    L->data[i - 1] = e;

    // 4. 表长加 1
    L->length++;
    return 1;
}


int main() {
    SqList List_a;
    List_a.length = 10;
    SqList* L = &List_a;

    for (int i=0; i<List_a.length; i++) {
        List_a.data[i] = 0;
        printf("%d ", List_a.data[i]);
    }

    printf("\n");

    ListInsert(L, 3, 1);

    for (int i=0; i<List_a.length; i++) {
        printf("%d ", List_a.data[i]);
    }

    return 0;
}
