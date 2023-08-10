#include<stdio.h>



int main(){
    
    int n;
    scanf("%d",&n);
    int A[1000000];
    for(int i = 0;i < n ; i++){
        scanf("%d",&A[i]);
    }
    bubbleSort(A,n);
    for(int i = 0;i < n ; i++){
        printf("%d ",A[i]);
    }
}