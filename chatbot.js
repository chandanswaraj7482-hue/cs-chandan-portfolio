document.addEventListener('DOMContentLoaded', () => {

    // DOM Elements
    const chatContainer = document.getElementById('chat-container');
    const chatTrigger = document.getElementById('chat-trigger');
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const typingIndicator = document.getElementById('typing-indicator');

    if(!chatContainer || !chatTrigger) return;

    // ✅ FIXED GOOGLE SCRIPT URL
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwNK8H328o6RgunndGR9yGOsx67tz0-7YWVeHz4cBAbQnJw8-4hxLBI9rR5vXBuWIoV/exec";

    let currentStep = 0;
    let inactivityTimer;
    let inactivityTriggered = false;

    const userData = {
        name: '',
        service: '',
        customService: '',
        goal: '',
        budget: '',
        platform: '',
        deadline: '',
        projectDetails: '',
        reference: '',
        contact: ''
    };

    const flow = [
        {
            question: "Hey 👋\nWant better results from your content or brand? 🚀\n\nTell me what you need 👇",
            options: [
                "YouTube Thumbnails 🚀",
                "Instagram Posts / Ads 🔥",
                "Logo Design 🎯",
                "Branding Package 💼",
                "Other"
            ],
            field: "service"
        },
        {
            question: "Tell me exactly what you need 👇",
            field: "customService",
            condition: (data) => data.service === "Other"
        },
        {
            question: "What’s your main goal?",
            options: ["More views", "More sales", "Better branding"],
            field: "goal"
        },
        {
            question: "What’s your budget?",
            options: ["₹500–₹2000", "₹2000–₹5000", "₹5000+"],
            field: "budget"
        },
        {
            question: "Where will this design be used?",
            options: ["YouTube", "Instagram", "Ads", "Website", "Other"],
            field: "platform"
        },
        {
            question: "When do you need this?",
            options: ["Urgent (24–48 hrs)", "2–3 days", "1 week+", "Not sure"],
            field: "deadline"
        },
        {
            question: "Tell me about your project 👇\n(Details, references, timeline)",
            field: "projectDetails"
        },
        {
            question: "Do you have any reference? Paste link 👇 (Drive / Pinterest / Instagram)",
            field: "reference"
        },
        {
            question: "What’s your name?",
            field: "name"
        },
        {
            question: "Share your WhatsApp or email 👇\nI’ll contact you with strategy + pricing 🔥",
            field: "contact"
        }
    ];

    // Chat Toggle
    chatTrigger.addEventListener('click', () => {
        chatContainer.classList.toggle('active');

        if (chatContainer.classList.contains('active')) {
            userInput.focus();
            if (chatMessages && chatMessages.children.length === 0) {
                startFlow();
            }
        }

        resetInactivityTimer();
    });

    // Inactivity (ONLY ONCE)
    const resetInactivityTimer = () => {
        clearTimeout(inactivityTimer);
        if (!inactivityTriggered && currentStep < flow.length) {
            inactivityTimer = setTimeout(() => {
                addBotMessage("Hey 👀 Still there? Let’s get you better results 🚀");
                inactivityTriggered = true;
            }, 7000);
        }
    };

    const showTyping = (show) => {
        if(typingIndicator) typingIndicator.style.display = show ? 'flex' : 'none';
    };

    const addBotMessage = (text, options = []) => {
        showTyping(true);

        setTimeout(() => {
            showTyping(false);

            const msg = document.createElement('div');
            msg.className = 'message bot-message';
            msg.innerText = text;
            chatMessages.appendChild(msg);

            if (options.length > 0) {
                const wrap = document.createElement('div');
                wrap.className = 'options-wrap';

                options.forEach(opt => {
                    const btn = document.createElement('button');
                    btn.className = 'option-btn';
                    btn.innerText = opt;
                    btn.onclick = () => {
                        addUserMessage(opt);
                        processInput(opt);
                    };
                    wrap.appendChild(btn);
                });

                chatMessages.appendChild(wrap);
            }

            chatMessages.scrollTop = chatMessages.scrollHeight;
            resetInactivityTimer();

        }, 600);
    };

    const addUserMessage = (text) => {
        const msg = document.createElement('div');
        msg.className = 'message user-message';
        msg.innerText = text;
        chatMessages.appendChild(msg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const startFlow = () => {
        const step = flow[currentStep];

        if (step.condition && !step.condition(userData)) {
            currentStep++;
            startFlow();
            return;
        }

        addBotMessage(step.question, step.options || []);
    };

    const validateContact = (input) => {
        const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phone = /^\+?\d{10,15}$/;

        if (["1111111111", "1234567890", "0000000000"].includes(input)) return false;

        return email.test(input) || phone.test(input);
    };

    // ✅ FIXED GOOGLE SHEET SEND
    const sendToGoogleSheets = (data) => {
        console.log("Sending:", data);

        fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
        .then(res => {
            console.log("Response:", res);
            return res.text();
        })
        .then(data => console.log("Success:", data))
        .catch(err => console.error("Error:", err));
    };

    const processInput = (input) => {
        const lower = input.toLowerCase();

        if (lower.includes("price") || lower.includes("cost") || lower.includes("kitna")) {
            addBotMessage("Pricing depends on your goal 👍\nFirst tell me your goal 👇");
            return;
        }

        const step = flow[currentStep];

        if (step.field === "contact") {

            if (!validateContact(input)) {
                addBotMessage("Please enter valid WhatsApp or email 👍");
                return;
            }

            userData.contact = input;
            addUserMessage(input);

            // FINAL MESSAGE
            addBotMessage("Perfect 👍\n\nI’ve got your details.\n\nI’ll review your requirement and message you with:\n• Best design direction\n• Strategy\n• Pricing\n\nLet’s build something that actually converts 🚀");

            // SEND DATA
            sendToGoogleSheets({
                name: userData.name,
                whatsapp: userData.contact,
                goal: userData.goal,
                budget: userData.budget,
                message: `${userData.service} | ${userData.projectDetails}`,
                platform: userData.platform,
                deadline: userData.deadline,
                reference: userData.reference
            });

            clearTimeout(inactivityTimer);
            return;
        }

        userData[step.field] = input;
        currentStep++;

        if (currentStep < flow.length) {
            startFlow();
        }
    };

    const handleSend = () => {
        if(!userInput) return;
        const val = userInput.value.trim();
        if (!val) return;

        userInput.value = '';
        addUserMessage(val);
        processInput(val);
    };

    if(sendBtn) {
        sendBtn.addEventListener('click', handleSend);
    }

    if(userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });
    }

});
