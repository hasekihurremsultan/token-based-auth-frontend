const Footer = ({ className = "" }) => {
    const year = new Date().getFullYear();
    const textContent = `© ${year} Example App - This is an example app and the app's all rights reserved.`

    return (
        <footer
            className={`mt-4 block py-2 text-sm text-gray-500 tracking-tighter italic footer-text ${className}`}
        >
            {textContent}
        </footer>
    )
}

export default Footer;