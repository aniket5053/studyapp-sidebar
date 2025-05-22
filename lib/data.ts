// Types
export type ClassWorkspace = {
  id: string
  name: string
  code: string
  color: string
  initial: string
  tasks: number
  files?: File[]
  assignments?: Assignment[]
}

export type Task = {
  id: string
  created_at: string
  title: string
  type: string
  status: 'not-started' | 'in-progress' | 'to-submit' | 'done'
  date: string
  class_id: string
  user_id: string
  archived: boolean
}

export type File = {
  id: string
  name: string
  size: string
  type: string
  url?: string
}

export type Assignment = {
  id: string
  name: string
  dueDate: string
  type: string
  subject: string
  files?: File[]
}

export type Class = {
  id: string
  name: string
  code: string
  color: string
  user_id: string
}

// Mock data
export const classWorkspaces: ClassWorkspace[] = [
  {
    id: "math",
    code: "MATH 101",
    name: "Mathematics",
    color: "#FFD6E0",
    initial: "M",
    tasks: 3,
    files: [
      { id: "math-syllabus", name: "Math Syllabus.pdf", size: "1.2MB", type: "syllabus" },
      { id: "math-textbook", name: "Calculus Textbook.pdf", size: "15.8MB", type: "textbook" },
    ],
    assignments: [
      { id: "math-hw1", name: "MATH 101: HW #1", dueDate: "2024-09-15", type: "Homework", subject: "MATH 101" },
      { id: "math-hw2", name: "MATH 101: HW #2", dueDate: "2024-09-22", type: "Homework", subject: "MATH 101" },
    ],
  },
  {
    id: "cs",
    code: "CMPE 260",
    name: "Computer Science",
    color: "#C7CEEA",
    initial: "CS",
    tasks: 5,
    files: [
      { id: "cs-syllabus", name: "Outline 260.pdf", size: "121.8KB", type: "syllabus" },
      { id: "cs-lab-manual", name: "Digital System Design II Manual.pdf", size: "1921.5KB", type: "lab-manual" },
    ],
    assignments: [
      { id: "cs-lab1", name: "CMPE 260: Lab #1", dueDate: "September 9, 2024", type: "Lab", subject: "CMPE 260" },
      { id: "cs-hw1", name: "CMPE 260: HW #1", dueDate: "2024-09-13", type: "Homework", subject: "CMPE 260" },
      { id: "cs-hw2", name: "CMPE 260: HW #2", dueDate: "2024-09-20", type: "Homework", subject: "CMPE 260" },
      { id: "cs-hw3", name: "CMPE 260: HW #3", dueDate: "2024-09-27", type: "Homework", subject: "CMPE 260" },
    ],
  },
  {
    id: "bio",
    code: "BIO 110",
    name: "Biology",
    color: "#B5EAD7",
    initial: "B",
    tasks: 2,
    files: [{ id: "bio-syllabus", name: "Biology Syllabus.pdf", size: "980KB", type: "syllabus" }],
    assignments: [
      { id: "bio-lab1", name: "BIO 110: Lab #1", dueDate: "September 12, 2024", type: "Lab", subject: "BIO 110" },
      { id: "bio-hw1", name: "BIO 110: HW #1", dueDate: "2024-09-19", type: "Homework", subject: "BIO 110" },
    ],
  },
  {
    id: "hist",
    code: "HIST 205",
    name: "History",
    color: "#FFEF9F",
    initial: "H",
    tasks: 0,
    files: [{ id: "hist-syllabus", name: "History Syllabus.pdf", size: "750KB", type: "syllabus" }],
    assignments: [],
  },
  {
    id: "phys",
    code: "PHYS 201",
    name: "Physics",
    color: "#E2F0CB",
    initial: "P",
    tasks: 1,
    files: [{ id: "phys-syllabus", name: "Physics Syllabus.pdf", size: "1.1MB", type: "syllabus" }],
    assignments: [
      { id: "phys-hw1", name: "PHYS 201: HW #1", dueDate: "2024-09-14", type: "Homework", subject: "PHYS 201" },
    ],
  },
]

export const tasks: Task[] = [
  {
    id: "task1",
    title: "Dr appointment",
    date: "2025-05-20T11:00:00",
    endTime: "11:30:00",
    status: "not-started",
    type: "appointment",
  },
  {
    id: "task2",
    title: "Quiz",
    status: "not-started",
    type: "quiz",
    classId: "cs",
  },
  {
    id: "task3",
    title: "Lab Report",
    status: "to-submit",
    type: "lab",
    classId: "bio",
    date: "2024-09-15",
  },
  {
    id: "task4",
    title: "Midterm Study Guide",
    status: "done",
    type: "study",
    classId: "math",
  },
  {
    id: "task5",
    title: "Read Chapter 3",
    status: "not-started",
    type: "reading",
    classId: "hist",
    date: "2024-09-10",
  },
  {
    id: "task6",
    title: "Physics Problem Set",
    status: "to-submit",
    type: "homework",
    classId: "phys",
    date: "2024-09-14",
  },
]

export const homeworkItems = [
  { id: "hw1", name: "HW #1", dueDate: "2024-09-13", classId: "cs" },
  { id: "hw2", name: "HW #2", dueDate: "2024-09-20", classId: "cs" },
  { id: "hw3", name: "HW #3", dueDate: "2024-09-27", classId: "cs" },
  { id: "hw4", name: "HW #4", dueDate: "2024-10-04", classId: "cs" },
  { id: "hw5", name: "HW #5", dueDate: "2024-10-11", classId: "cs" },
  { id: "hw6", name: "HW #6", dueDate: "2024-10-18", classId: "cs" },
  { id: "hw7", name: "HW #7", dueDate: "2024-10-25", classId: "cs" },
  { id: "hw8", name: "HW #8", dueDate: "2024-11-01", classId: "cs" },
  { id: "hw9", name: "HW #9", dueDate: "2024-11-08", classId: "cs" },
  { id: "hw10", name: "HW #10", dueDate: "2024-11-15", classId: "cs" },
  { id: "hw11", name: "HW #11", dueDate: "2024-11-22", classId: "cs" },
  { id: "hw12", name: "HW #12", dueDate: "2024-11-29", classId: "cs" },
  { id: "hw13", name: "HW #13", dueDate: "2024-12-06", classId: "cs" },
]

export const labs = [
  { id: "lab1", name: "Lab #1", week: "Week 1", classId: "cs" },
  { id: "lab2", name: "Lab #2", week: "Week 2", classId: "cs" },
  { id: "lab3", name: "Lab #3", week: "Week 3", classId: "cs" },
  { id: "lab4", name: "Lab #4", week: "Week 1", classId: "bio" },
]

export const homeworkDetail = {
  id: "hw1",
  title: "HW #1",
  dueDate: "September 13, 2024",
  subject: "CMPE 260",
  lectureWeek: "",
  topics: "",
  files: [
    { id: "hw1-pdf", name: "hw1.pdf", size: "290.8KB", type: "homework" },
    { id: "hw1-completed", name: "HW01.pdf", size: "423.4KB", type: "completed" },
  ],
}
