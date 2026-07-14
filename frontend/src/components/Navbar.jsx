
function Navbar() {
  return (
   <header>
     <nav className="flex justify-between items-center w-full mx-auto py-4 px-8 bg-gray-300">
            <p>NoQ</p>
            <ul className="gap-4 md:flex hidden justify-center items-center">
                <li><a href="#services">services</a></li>
                <li><a href="#how-it-works">How it works</a></li>
                <li><a href="#home">Home</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
            <ul className=" sidebar fixed flex  flex-col gap-4 bg-transparent p-4  right-0 h-full w-full md:hidden hidden">
                <li><a href="#services">services</a></li>
                <li><a href="#how-it-works">How it works</a></li>
                <li><a href="#home">Home</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>  
            <div className="md:flex hidden justify-end gap-4">
                <a href="login.html">
                    <button class="bg-blue-500 text-white py-2 px-4 rounded">Login</button>
                </a> 
                <a href="login.html">
                <button className="bg-green-500 text-white py-2 px-4 rounded">Get a token</button>
                </a>
        </div>
        <div onClick="toggleSidebar()" class="bar cursor-pointer md:hidden flex justify-end gap-4">
            <i className="bar fa-solid fa-bars fa-lg"></i>
        </div>
       </nav>
    </header>
  )
}

export default Navbar;