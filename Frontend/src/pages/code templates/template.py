def bubbleSort(A):
    A[0] = 100

n = int(input())
A = list(map(int,input().split(" ")))
bubbleSort(A)
print(*A)