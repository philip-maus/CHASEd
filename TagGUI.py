from tkinter import *
import tkinter.filedialog
import eyed3


class TagGUIWindow(Frame):
    def __init__(self, master=None):
        Frame.__init__(self, master)
        self.master = master


if __name__=="__main__":
    root = Tk()
    app = TagGUIWindow(root)
    root.wm_title("CHASEd TagGUI")
    root.mainloop()
