## 💼 **Creating a Standout Portfolio**

* We are building this Portfolio website using the **mkdocs** library, which is a simple and powerful tool for creating static websites. 
* It allows us to focus on writing content in Markdown while it takes care of generating a clean and professional looking website for us.
* With mkdocs, we can easily organize our content into sections, add navigation menus and even customize the design using themes. It’s perfect for creating a portfolio because it keeps everything neat and easy to manage.
### **Key Features of MkDocs**

1. **Markdown-Based**:  
   MkDocs uses Markdown, a lightweight markup language, for writing content. This makes it easy to create and format text.

2. **Simple Configuration**:  
   The configuration is done using a single `mkdocs.yml` file. This file allows to define the structure of site, navigation menus, themes, and plugins.

3. **Built-In Themes**:  
   MkDocs comes with several built-in themes, including the popular **Material for MkDocs**, provides a modern and professional look for website.

4. **Fast and Lightweight**:  
   MkDocs is optimized for speed and simplicity. It generates static HTML files, which are lightweight and load quickly in browsers.

5. **Free Hosting with GitHub Pages**:  
   MkDocs integrates seamlessly with GitHub Pages, allowing to host site for free.

> To learn more about MkDocs, visit their official website here: [MkDocs Official Website](https://www.mkdocs.org/).

### How Does MkDocs Work?

1. **Install MkDocs**:  
   MkDocs can be installed using Python's package manager, pip. First we create a Python 3.12 environment using Conda and activate it:

   ```bash
   # Create a new Conda environment with Python 3.12
   conda create -n mkdocs_env python=3.12 -y

   # Activate the environment
   conda activate mkdocs_env

   # Install MkDocs
   pip install mkdocs
   ```

2. **Build Portfolio using mkdocs
```bash
   # Build a portfolio using mkdocs
   mkdocs new my_datascience_and_ai_portfolio
   cd my_datascience_and_ai_portfolio
   ```
3. **Run the Development Server
```bash
   # Run the Development Server
   mkdocs serve
   ```

4. **Specify the Port number
```bash
   # we can specify the port number also in that way
   mkdocs serve --dev-addr=127.0.0.1:8085
   ```

5. **Build the Project**
```bash
   mkdocs build
   ```


