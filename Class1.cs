using System;

public class Class1
{
	public Class1()
	{
        System.IO.File.Open("C:\\myfile.txt", System.IO.FileMode.Open);
	}
    public static void Main()
    {
        Class1 c = new Class1();

        System.Console.WriteLine("Hello, World!");
    }
}

