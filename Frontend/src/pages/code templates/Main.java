import java.util.*;
import java.util.Scanner;

class Solution {
    public void bubbleSort(ArrayList<Integer> A) {
        A.set(0,100);
    }
}

public class Main {
    
    public static void main(String[] args) {
        Scanner scan = new Scanner(System.in);
        int n = scan.nextInt();
        int temp;
        ArrayList<Integer> A = new ArrayList<>();
        for(int i=0;i<n;i++){
            temp = scan.nextInt();
            A.add(temp);
        }
        Solution obj = new Solution();
        obj.bubbleSort(A);
        for(int i=0;i<n;i++){
            System.out.print(A.get(i));
            System.out.print(" ");
        }
    }
    
}


