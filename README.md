# Cache Simulator using Block Set Associative, LRU
![image](https://github.com/user-attachments/assets/5ec0b3cf-72e5-42fa-9eff-462f28d89871)
## How to use: 
Block Size = Words per block

Set Size = Blocks per set

MM Memory Size = Total blocks/words in main memory 

Cache Memory Size = Total blocks/words in cache memory

Program Flow = String of space-separated blocks (integers) or words (hex) to be stored in the cache in series
- Block example: 1, 2, 3, 4, 5
- Word example: A109, B2, C31, D4F, E500 

## Restrictions:
- Inputs must be a power of 2 with the exception of Cache Access Time, Main Memory Access Time, and Program Flow
- Inputs must be greater than 0 with the exception of Program Flow
- Cache Memory Size (blocks) mod Set Size = 0
- Cache Memory Size (words) mod Block Size = 0
- MM Memory Size >= Cache Memory Size 
- Each address/block in program flow must not be greater than the max MM Memory Size
- Should unrelated characters be inputted into Program Flow, they will be treated as spaces/separation indicators
