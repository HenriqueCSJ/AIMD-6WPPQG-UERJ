# Pilotos operacionais de MD — 28/09/2026

[← Roteiro](../../exercicios/roteiro-4h.md)

Os quatro pilotos iniciais de MD foram executados **sequencialmente**, em serial, com uma thread configurada, ORCA 6.1.1, Ubuntu 24.04.4/WSL2, no Intel Core Ultra 9 185H. Todos terminaram com `ORCA TERMINATED NORMALLY`; os testes adicionais de XTB2/SOLVATOR estão registrados ao final. Cronometragem local de uma execução por caso, incluindo inicialização; não é benchmark estatístico nem promessa de tempo em outro computador.

**Finalidade:** verificar funcionamento, sintaxe e formato de arquivo antes de preparar os exercícios. H₂O de 3 átomos, carga 0, multiplicidade 1, geometria didática não otimizada; semente 42 e timestep de 0,5 fs. **Não usar esses pilotos como evidência de equilíbrio, qualidade científica do método, convergência do timestep ou validade da parede para o aglomerado.** O raio de 5 Å deixou a molécula de água inicialmente bem dentro da esfera; este teste não demonstra retenção de moléculas que evaporariam.

- **BLYP/def2-SVP, NVE:** 40 passos, 20 fs = 2e-14 s simulados; 14.413 s de execução. [Input](../../inputs/02-aimd/pilotos-validacao/agua_dft.inp) · [CSV](agua_dft-md-ener.csv).
- **BLYP/def2-SVP + CPCM(water), NVE:** 40 passos, 20 fs = 2e-14 s simulados; 16.317 s de execução. [Input](../../inputs/02-aimd/pilotos-validacao/agua_dft_cpcm.inp) · [CSV](agua_dft_cpcm-md-ener.csv).
- **Native-XTB2, NVE:** 100 passos, 50 fs = 5e-14 s simulados; 9.292 s de execução. [Input](../../inputs/02-aimd/pilotos-validacao/agua_xtb2.inp) · [CSV](agua_xtb2-md-ener.csv).
- **Native-XTB2 + ALPB(water), CSVR 300 K / 100 fs e Cell esférica de 5 Å / Spring 10:** 100 passos, 50 fs = 5e-14 s simulados; 9.141 s de execução. [Input](../../inputs/02-aimd/pilotos-validacao/agua_xtb2_alpb_cell.inp) · [CSV](agua_xtb2_alpb_cell-md-ener.csv).

Os arquivos contêm 41 ou 101 registros, incluindo o passo 0. Separador `;`, decimal `.`, tempo físico em fs, temperatura em K, energias em Hartree. A saída principal confirmou essas unidades. Campos vazios são legítimos. O teste com célula acrescenta `Av.Press.`. A soma E_Kin + E_Pot concorda com E_Tot até aproximadamente 10⁻⁶ Hartree, compatível com o arredondamento das colunas. `Cons.Qty` é outro canal e não substitui E_Tot.

O teste com ALPB, CSVR e Cell confirma que os comandos funcionam juntos no caso de água. Como múltiplas opções foram ativadas simultaneamente, não isola o efeito de cada uma; essa separação pertence aos exercícios propostos. Os dados são íntegros, sem suavização ou alteração, e podem servir como entradas reais de teste do visualizador.

As trajetórias XYZ e saídas completas foram preservadas no ambiente de execução dos ministrantes; os CSV e inputs necessários para reproduzir e testar o parser estão neste diretório e no link acima. Não há binários ORCA redistribuídos.

## Inclusão de SOLVATOR: teste adicional e mudança de rota

O SOLVATOR com `Native-XTB2 ALPB(water)` foi rejeitado pelo ORCA 6.1.1 antes de calcular, com erro informando suporte a GFN-XTB/GFN-FF/SURFF. Não produziu estrutura nem resultado científico. A execução por `XTB2 ALPB(water)` com **xTB externo 6.7.1** funcionou:

- Água + 2 águas, `CLUSTERMODE DOCKING`, `FIXSOLUTE TRUE`: **7,385 s**, término normal do SOLVATOR e ORCA; resultado de **9 átomos**. [Input](../../inputs/03-solvatacao/pilotos-validacao/agua_solvator_external.inp) · [XYZ gerado](agua_solvator_external.solvator.xyz).
- MD de água com `XTB2` externo, NVE, 100 passos de 0,5 fs = 50 fs: **1,619 s**, término normal. [Input](../../inputs/02-aimd/pilotos-validacao/agua_xtb2_external.inp) · [CSV](agua_xtb2_external-md-ener.csv).

Mesmo ambiente e geometria não otimizada dos testes anteriores; execução sequencial e serial. São resultados de uma única execução, não comparação estatística de desempenho. A partir da inclusão de SOLVATOR, a rota proposta para os exercícios GFN2-xTB é a interface externa, com instalação/teste prévios. O complexo de Zn²⁺–etilenodiamina **ainda não foi calculado**; estes testes não validam sua química ou tempo de execução.
