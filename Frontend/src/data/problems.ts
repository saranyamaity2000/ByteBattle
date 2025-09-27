export interface Problem {
	id: string;
	title: string;
	difficulty: "Easy" | "Medium" | "Hard";
	category: string;
	description: string;
	constraints: string[];
	examples: {
		input: string;
		output: string;
		explanation?: string;
	}[];
	starterCode: {
		cpp: string;
		python: string;
	};
}

export const problems: Problem[] = [
	{
		id: "two-sum",
		title: "Two Sum",
		difficulty: "Easy",
		category: "Array",
		description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
		constraints: [
			"2 ≤ nums.length ≤ 10⁴",
			"-10⁹ ≤ nums[i] ≤ 10⁹",
			"-10⁹ ≤ target ≤ 10⁹",
			"Only one valid answer exists.",
		],
		examples: [
			{
				input: "nums = [2,7,11,15], target = 9",
				output: "[0,1]",
				explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
			},
			{
				input: "nums = [3,2,4], target = 6",
				output: "[1,2]",
			},
			{
				input: "nums = [3,3], target = 6",
				output: "[0,1]",
			},
		],
		starterCode: {
			cpp: `// Your code here`,
			python: `# Your code here`,
		},
	},
	{
		id: "reverse-string",
		title: "Reverse String",
		difficulty: "Easy",
		category: "String",
		description: `Write a function that reverses a string. The input string is given as an array of characters s.

You must do this by modifying the input array in-place with O(1) extra memory.`,
		constraints: ["1 ≤ s.length ≤ 10⁵", "s[i] is a printable ascii character."],
		examples: [
			{
				input: 's = ["h","e","l","l","o"]',
				output: '["o","l","l","e","h"]',
			},
			{
				input: 's = ["H","a","n","n","a","h"]',
				output: '["h","a","n","n","a","H"]',
			},
		],
		starterCode: {
			cpp: `// Your code here`,
			python: `# Your code here`,
		},
	},
	{
		id: "valid-palindrome",
		title: "Valid Palindrome",
		difficulty: "Easy",
		category: "String",
		description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string s, return true if it is a palindrome, or false otherwise.`,
		constraints: ["1 ≤ s.length ≤ 2 × 10⁵", "s consists only of printable ASCII characters."],
		examples: [
			{
				input: 's = "A man, a plan, a canal: Panama"',
				output: "true",
				explanation: '"amanaplanacanalpanama" is a palindrome.',
			},
			{
				input: 's = "race a car"',
				output: "false",
				explanation: '"raceacar" is not a palindrome.',
			},
			{
				input: 's = " "',
				output: "true",
				explanation:
					's is an empty string "" after removing non-alphanumeric characters. Since an empty string reads the same forward and backward, it is a palindrome.',
			},
		],
		starterCode: {
			cpp: `// Your code here`,
			python: `# Your code here`,
		},
	},
	{
		id: "binary-search",
		title: "Binary Search",
		difficulty: "Medium",
		category: "Binary Search",
		description: `Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.

You must write an algorithm with O(log n) runtime complexity.`,
		constraints: [
			"1 ≤ nums.length ≤ 10⁴",
			"-10⁴ < nums[i], target < 10⁴",
			"All the integers in nums are unique.",
			"nums is sorted in ascending order.",
		],
		examples: [
			{
				input: "nums = [-1,0,3,5,9,12], target = 9",
				output: "4",
				explanation: "9 exists in nums and its index is 4",
			},
			{
				input: "nums = [-1,0,3,5,9,12], target = 2",
				output: "-1",
				explanation: "2 does not exist in nums so return -1",
			},
		],
		starterCode: {
			cpp: `// Your code here`,
			python: `# Your code here`,
		},
	},
	{
		id: "merge-intervals",
		title: "Merge Intervals",
		difficulty: "Medium",
		category: "Array",
		description: `Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.`,
		constraints: [
			"1 ≤ intervals.length ≤ 10⁴",
			"intervals[i].length == 2",
			"0 ≤ starti ≤ endi ≤ 10⁴",
		],
		examples: [
			{
				input: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
				output: "[[1,6],[8,10],[15,18]]",
				explanation: "Since intervals [1,3] and [2,6] overlap, merge them into [1,6].",
			},
			{
				input: "intervals = [[1,4],[4,5]]",
				output: "[[1,5]]",
				explanation: "Intervals [1,4] and [4,5] are considered overlapping.",
			},
		],
		starterCode: {
			cpp: `// Your code here`,
			python: `# Your code here`,
		},
	},
	{
		id: "longest-substring",
		title: "Longest Substring Without Repeating Characters",
		difficulty: "Medium",
		category: "String",
		description: `Given a string s, find the length of the longest substring without repeating characters.`,
		constraints: [
			"0 ≤ s.length ≤ 5 × 10⁴",
			"s consists of English letters, digits, symbols and spaces.",
		],
		examples: [
			{
				input: 's = "abcabcbb"',
				output: "3",
				explanation: 'The answer is "abc", with the length of 3.',
			},
			{
				input: 's = "bbbbb"',
				output: "1",
				explanation: 'The answer is "b", with the length of 1.',
			},
			{
				input: 's = "pwwkew"',
				output: "3",
				explanation:
					'The answer is "wke", with the length of 3. Notice that the answer must be a substring, "pwke" is a subsequence and not a substring.',
			},
		],
		starterCode: {
			cpp: `// Your code here`,
			python: `# Your code here`,
		},
	},
	{
		id: "fibonacci-number",
		title: "Fibonacci Number",
		difficulty: "Easy",
		category: "Math",
		description: `The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.

Given n, calculate F(n).`,
		constraints: ["0 ≤ n ≤ 30"],
		examples: [], // No examples to test edge case
		starterCode: {
			cpp: `// Your code here`,
			python: `# Your code here`,
		},
	},
	{
		id: "maximum-subarray",
		title: "Maximum Subarray",
		difficulty: "Medium",
		category: "Dynamic Programming",
		description: `Given an integer array nums, find the subarray with the largest sum, and return its sum.

A subarray is a contiguous non-empty sequence of elements within an array.`,
		constraints: ["1 ≤ nums.length ≤ 10⁵", "-10⁴ ≤ nums[i] ≤ 10⁴"],
		examples: [
			{
				input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
				output: "6",
				// No explanation to test edge case
			},
			{
				input: "nums = [1]",
				output: "1",
				// No explanation to test edge case
			},
			{
				input: "nums = [5,4,-1,7,8]",
				output: "23",
				// No explanation to test edge case
			},
		],
		starterCode: {
			cpp: `// Your code here`,
			python: `# Your code here`,
		},
	},
];

export const getProblemById = (id: string): Problem | undefined => {
	return problems.find((problem) => problem.id === id);
};

export const getProblemsByDifficulty = (difficulty: Problem["difficulty"]): Problem[] => {
	return problems.filter((problem) => problem.difficulty === difficulty);
};

export const getProblemsByCategory = (category: string): Problem[] => {
	return problems.filter((problem) => problem.category === category);
};
