import sys
from PIL import Image
out=sys.argv[1]; fs=[f'hs_{s}_{v}.png' for s in (1,-1) for v in range(5)]
o=Image.new('RGB',(2000,800))
for i,f in enumerate(fs): o.paste(Image.open(f),((i%5)*400,(i//5)*400))
o.resize((1250,500)).save(out+'.png')
