#include<bits/stdc++.h>

using namespace std;

void bubbleSort(vector<int> &A){
    A[0] = 100;
}

int main(){
    int n;
    cin >> n;
    vector<int> A(n);
    for(int i = 0;i < n ;i++){
        cin >> A[i];
    }
    bubbleSort(A);
    for(int i = 0; i < n;i++){
        cout << A[i] << " ";
    }
    return 0;
}