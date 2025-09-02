const express=require('express')
const bodyParser=require('body-parser')
const mysql=require('mysql')
const path=require('path')
const session=require('express-session')
const multer=require('multer')

const app=express()
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(express.static(__dirname))
app.use('/uploads', express.static('uploads'))
app.use(session({
    secret:'restaurant_secret_key',
    resave:false,
    saveUninitialized:false,
    cookie:{maxAge:600000, secure:false, httpOnly:false}
}))

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploads/')
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+'-'+file.originalname)
    }
})
const upload=multer({storage:storage})

const db=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'2624',
    database:'hotelusers'
})

db.connect(err=>{
    if(err){ console.log("MySQL Connection Error:", err); throw err }
    console.log("MySQL Connected")
    
    const createTableQuery=`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            phone VARCHAR(20) NOT NULL,
            password VARCHAR(255) NOT NULL,
            address TEXT,
            avatar VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `
    db.query(createTableQuery,(err,result)=>{
        if(err) console.log("Error creating table:", err)
        else console.log("Users table ready")
    })
})

// SIGNUP
app.post('/signup',(req,res)=>{
    const{name,email,phone,password,address}=req.body
    console.log('Signup attempt:', {name,email,phone})
    
    const sql="INSERT INTO users(name,email,phone,password,address) VALUES(?,?,?,?,?)"
    db.query(sql,[name,email,phone,password,address],err=>{
        if(err){
            console.log("Signup error:", err)
            if(err.code==='ER_DUP_ENTRY') return res.status(400).send("Email already exists.")
            return res.status(500).send("Error: "+err.message)
        }
        console.log('Signup successful for:', email)
        res.redirect('index.html')
    })
})

// LOGIN
app.post('/login',(req,res)=>{
    const{email,password}=req.body
    console.log('Login attempt:', {email,password})
    
    const sql="SELECT * FROM users WHERE email=? AND password=?"
    db.query(sql,[email,password],(err,results)=>{
        if(err){ console.log("DB error:",err); return res.status(500).send(err.message) }
        if(results.length>0){
            req.session.user=results[0]
            console.log('Login successful for:', results[0].email)
            res.redirect('index.html')
        }else{
            console.log('Login failed for:', email)
            res.status(401).send('Invalid email or password')
        }
    })
})

// LOGOUT
app.get('/logout',(req,res)=>{
    req.session.destroy()
    res.redirect('index.html')
})

// AUTH STATUS
app.get('/auth-status',(req,res)=>{
    res.json({
        loggedIn: !!req.session.user,
        user: req.session.user || null
    })
})

// CURRENT USER
app.get('/current-user',(req,res)=>{
    if(!req.session.user) return res.status(401).json({error:'Not logged in'})
    res.json(req.session.user)
})

// PROFILE
app.get('/profile',(req,res)=>{
    if(!req.session.user) return res.redirect('login.html')
    res.sendFile(__dirname+'/profile.html')
})

// AVATAR UPLOAD
app.post('/upload-avatar',upload.single('avatar'),(req,res)=>{
    if(!req.session.user) return res.redirect('login.html')
    if(req.file){
        const avatarPath=req.file.filename
        const sql="UPDATE users SET avatar=? WHERE id=?"
        db.query(sql,[avatarPath,req.session.user.id],err=>{
            if(err) return res.send('Error uploading avatar')
            req.session.user.avatar=avatarPath
            res.redirect('/profile')
        })
    }else res.redirect('/profile')
})

// DEBUG USERS
app.get('/debug-users',(req,res)=>{
    const sql="SELECT id, name, email, phone FROM users"
    db.query(sql,(err,results)=>{
        if(err){
            return res.json({error:err.message})
        }
        res.json({users:results, count:results.length})
    })
})

// FORGOT PASSWORD - Simple version
app.post('/forgot-password',(req,res)=>{
    const{email}=req.body
    console.log('Password reset requested for:', email)

    // Check if user exists in database
    const sql="SELECT * FROM users WHERE email=?"
    db.query(sql,[email],(err,results)=>{
        if(err){ console.log(err); return res.json({success:false,message:'Database error'}) }
        if(results.length===0){
            console.log('Email not found:', email)
            return res.json({success:false,message:'Email not found'})
        }

        // For now, just return success - frontend will handle Firebase
        console.log('User found, frontend will handle password reset for:', email);
        
        return res.json({
            success:true,
            message:'Please check your email for password reset instructions'
        })
    })
})

app.listen(3000,()=>console.log("Server running at http://localhost:3000"))
