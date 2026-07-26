async function login() {
    

    const username =
        document.getElementById("username").value;

    const password =
        document.getElementById("password").value;

    if (username === "" || password === "") {

        document.getElementById("error").innerHTML =
            "Please enter username and password.";

        return;

    }

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    username: username,

                    password: password

                })

            }
        );

        const result = await response.json();

        if (result.success) {

            localStorage.setItem(
                "user",
                JSON.stringify(result.user)
            );

            localStorage.setItem(
                "login",
                "true"
            );

            window.location.href = "index.html";

        }
        else {

            document.getElementById("error").innerHTML =
                result.message;

        }

    }
    catch (error) {

        console.log(error);

        document.getElementById("error").innerHTML =
            "Cannot connect to server.";

    }

}