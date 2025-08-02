# DDI Phone Field

Plugin WordPress que adiciona campos de telefone internacionais com DDI e bandeiras de países aos formulários do Elementor, Contact Form 7 e WooCommerce.

## 📋 Características

- ✅ Campo de telefone internacional com bandeira do país
- ✅ Código DDI automático
- ✅ Validação de números de telefone
- ✅ Formatação automática
- ✅ Integração com Elementor
- ✅ Integração com Contact Form 7
- ✅ Integração com WooCommerce
- ✅ Personalização de cores e estilos
- ✅ Suporte a múltiplos idiomas
- ✅ Estrutura organizacional moderna

## 🏗️ Estrutura do Plugin

```
ddi-phone-field/
│
├── .gitignore                    # Arquivos ignorados pelo Git
├── README.md                     # Este arquivo
├── readme.txt                    # Arquivo readme para WordPress.org
├── composer.json                 # Dependências PHP
├── package.json                  # Dependências JavaScript
├── ddi-phone-field.php          # Arquivo principal do plugin
│
├── assets/                       # Recursos estáticos
│   ├── css/
│   │   └── ddi-phone-field.css   # Estilos do plugin
│   └── js/
│       ├── ddi-phone-field.js    # JavaScript principal
│       └── admin.js              # JavaScript administrativo
│
├── includes/                     # Classes PHP do plugin
│   ├── core/                     # Funções genéricas
│   │   └── class-loader.php      # Carregador de classes
│   ├── admin/                    # Área administrativa
│   │   └── class-admin-settings.php
│   ├── elementor/                # Integração Elementor
│   │   └── class-elementor-integration.php
│   ├── cf7/                      # Integração Contact Form 7
│   │   └── class-cf7-integration.php
│   └── woocommerce/              # Integração WooCommerce
│       └── class-woocommerce-integration.php
│
└── languages/                    # Arquivos de tradução
    ├── ddi-phone-field-pt_BR.po  # Português brasileiro
    ├── ddi-phone-field-pt_BR.mo  # Português brasileiro (compilado)
    ├── ddi-phone-field-en_US.po  # Inglês
    └── ddi-phone-field-en_US.mo  # Inglês (compilado)
```

## 🚀 Instalação

1. Faça upload do plugin para a pasta `/wp-content/plugins/`
2. Ative o plugin através do menu 'Plugins' no WordPress
3. Configure as opções em 'DDI Phone' no menu administrativo
4. Use o campo de telefone em seus formulários

## 📖 Como Usar

### HTML Básico
```html
<input type="tel" name="phone" placeholder="Digite seu telefone" />
```

### Elementor
1. Adicione o widget "Campo de Telefone Internacional"
2. Configure o rótulo, placeholder e outras opções
3. O campo será automaticamente convertido

### Contact Form 7
Use o shortcode `[tel]` para criar campos de telefone:
```
[tel* phone "Digite seu telefone"]
```

### WooCommerce
Os campos de telefone são automaticamente convertidos nos formulários de checkout e registro.

## ⚙️ Configurações

### Personalização de Cores
- **Cor de Fundo da Bandeira e DDI**: Cor de fundo da área da bandeira
- **Cor do Número DDI**: Cor do texto do código DDI
- **Cor da Borda do Campo**: Cor da borda do campo de telefone
- **Largura do Campo**: Largura do campo (ex: 100%, 50%, 300px)

## 🔧 Desenvolvimento

### Requisitos
- PHP 7.4+
- WordPress 5.0+
- jQuery

### Dependências
- **intl-tel-input**: Biblioteca para campos de telefone internacional
- **jquery.mask**: Biblioteca para máscaras de input

### Scripts Disponíveis
```bash
# Instalar dependências PHP
composer install

# Instalar dependências JavaScript
npm install

# Build para produção
npm run build

# Desenvolvimento com watch
npm run dev

# Linting
npm run lint
npm run lint:fix
```

## 🌐 Suporte a Idiomas

O plugin suporta:
- Português Brasileiro (pt_BR)
- Inglês (en_US)

Para adicionar novos idiomas:
1. Crie um arquivo `.po` na pasta `languages/`
2. Compile para `.mo` usando Poedit ou similar
3. O WordPress carregará automaticamente

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a GPL v2 ou posterior - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Wplugin** - [www.wplugin.com.br](https://www.wplugin.com.br)

## 🙏 Agradecimentos

- [intl-tel-input](https://github.com/jackocnr/intl-tel-input) - Biblioteca para campos de telefone internacional
- [jquery.mask](https://github.com/igorescobar/jQuery-Mask-Plugin) - Biblioteca para máscaras de input
- Comunidade WordPress

## 📞 Suporte

Para suporte, visite [www.wplugin.com.br](https://www.wplugin.com.br) ou abra uma issue neste repositório. 