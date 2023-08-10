const mainBubble = {
  "C (GCC 9.2.0)": `int main(){\n    \n    int n;\n    scanf("%d",&n);\n    int A[1000000];\n    for(int i = 0;i < n ; i++){\n        scanf("%d",&A[i]);\n    }\n    bubbleSort(A,n);\n    for(int i = 0;i < n ; i++){\n        printf("%d ",A[i]);\n    }\n}`,
  "C++ (GCC 9.2.0)": `int main(){\n    int n;\n    cin >> n;\n    vector<int> A(n);\n    for(int i = 0;i < n ;i++){\n        cin >> A[i];\n    }\n    bubbleSort(A);\n    for(int i = 0; i < n;i++){\n        cout << A[i] << " ";\n    }\n    return 0;\n}`,
  "Java (OpenJDK 13.0.1)": `public class Main {\n    \n    public static void main(String[] args) {\n        Scanner scan = new Scanner(System.in);\n        int n = scan.nextInt();\n        int temp;\n        ArrayList<Integer> A = new ArrayList<>();\n        for(int i=0;i<n;i++){\n            temp = scan.nextInt();\n            A.add(temp);\n        }\n        Solution obj = new Solution();\n        obj.bubbleSort(A);\n        for(int i=0;i<n;i++){\n            System.out.print(A.get(i));\n            System.out.print(" ");\n        }\n    }\n    \n}`,
  "Python (3.8.1)": `def main():\n    n = int(input())\n    A = list(map(int,input().split(" ")))\n    bubbleSort(A)\n    print(*A)\n\nmain()`,
};

export { mainBubble };
